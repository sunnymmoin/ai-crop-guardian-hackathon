import hmac
import re
from datetime import datetime, timedelta, timezone

import jwt

from .config import Settings


def normalize_phone(raw: str) -> str:
    """Bring Pakistani numbers to one format: '0300 1234567', '+92 300 1234567' -> '03001234567'."""
    digits = re.sub(r"\D", "", raw or "")
    if digits.startswith("0092"):
        digits = "0" + digits[4:]
    elif digits.startswith("92") and len(digits) == 12:
        digits = "0" + digits[2:]
    elif digits.startswith("3") and len(digits) == 10:
        digits = "0" + digits
    return digits


def is_valid_phone(phone: str) -> bool:
    return 10 <= len(phone) <= 15


def is_admin_phone(phone: str, settings: Settings) -> bool:
    return phone in {normalize_phone(p) for p in settings.admin_phones}


def admin_key_matches(candidate: str | None, settings: Settings) -> bool:
    if not settings.admin_key or not candidate:
        return False
    return hmac.compare_digest(candidate.encode(), settings.admin_key.encode())


def create_access_token(user_id: str, role: str, settings: Settings) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "role": role,
        "iat": now,
        "exp": now + timedelta(days=settings.jwt_expire_days),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str, settings: Settings) -> dict:
    """Raises jwt.PyJWTError if the token is invalid or expired."""
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
