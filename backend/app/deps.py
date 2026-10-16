"""Route-level middleware, implemented as FastAPI dependencies."""

import time
from collections import defaultdict, deque

import jwt
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pymongo.asynchronous.database import AsyncDatabase

from .config import Settings, get_settings
from .db import get_db
from .security import decode_access_token, is_admin_phone

_bearer = HTTPBearer(auto_error=False)


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: AsyncDatabase = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict | None:
    """Returns the logged-in user, or None for anonymous requests. A bad token is still a 401."""
    if credentials is None:
        return None
    try:
        payload = decode_access_token(credentials.credentials, settings)
        user_id = ObjectId(payload["sub"])
    except (jwt.PyJWTError, InvalidId, KeyError):
        raise _unauthorized("Session expired or invalid. Please log in again.")

    user = await db.users.find_one({"_id": user_id})
    if user is None:
        raise _unauthorized("Account no longer exists. Please register again.")
    user["role"] = payload.get("role", "farmer")
    return user


async def get_current_user(user: dict | None = Depends(get_optional_user)) -> dict:
    if user is None:
        raise _unauthorized("Please log in to continue.")
    return user


async def require_admin(
    user: dict = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
) -> dict:
    # Re-check the phone list so removing someone from ADMIN_PHONES takes effect immediately.
    if user["role"] != "admin" or not is_admin_phone(user["phone"], settings):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    return user


class RateLimiter:
    """Sliding-window limit per client IP and route. In-memory, so it resets on restart."""

    def __init__(self, setting_name: str, window_seconds: int = 60):
        self.setting_name = setting_name
        self.window = window_seconds
        self.hits: dict[tuple[str, str], deque[float]] = defaultdict(deque)

    async def __call__(self, request: Request, settings: Settings = Depends(get_settings)) -> None:
        limit = getattr(settings, self.setting_name)
        client = request.client.host if request.client else "unknown"
        key = (client, request.url.path)
        now = time.monotonic()
        hits = self.hits[key]
        while hits and hits[0] <= now - self.window:
            hits.popleft()
        if len(hits) >= limit:
            retry_after = int(self.window - (now - hits[0])) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please wait a moment and try again.",
                headers={"Retry-After": str(retry_after)},
            )
        hits.append(now)


auth_rate_limit = RateLimiter("rate_limit_auth_per_min")
predict_rate_limit = RateLimiter("rate_limit_predict_per_min")
