"""Global middleware and exception handlers."""

import logging
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.datastructures import MutableHeaders
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.types import ASGIApp, Message, Receive, Scope, Send

logger = logging.getLogger("crop_guardian.http")


class RequestContextMiddleware:
    """Gives every request an ID, adds timing headers, logs one line per request, and turns
    unhandled errors into a JSON 500. It sits inside CORSMiddleware so even 500s carry CORS headers."""

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        incoming = dict(scope.get("headers", [])).get(b"x-request-id", b"").decode()
        request_id = incoming[:64] or uuid.uuid4().hex[:12]
        scope.setdefault("state", {})["request_id"] = request_id
        start = time.perf_counter()
        status_code = 500
        response_started = False

        async def send_with_headers(message: Message) -> None:
            nonlocal status_code, response_started
            if message["type"] == "http.response.start":
                status_code = message["status"]
                response_started = True
                headers = MutableHeaders(scope=message)
                headers["X-Request-ID"] = request_id
                headers["X-Process-Time"] = f"{(time.perf_counter() - start) * 1000:.1f}ms"
            await send(message)

        try:
            await self.app(scope, receive, send_with_headers)
        except Exception:
            logger.exception("Unhandled error on %s %s [%s]", scope["method"], scope["path"], request_id)
            if response_started:
                raise
            response = JSONResponse(
                status_code=500,
                content={"detail": "Something went wrong on the server.", "request_id": request_id},
            )
            await response(scope, receive, send_with_headers)
        finally:
            logger.info(
                "%s %s -> %d (%.1fms) [%s]",
                scope["method"],
                scope["path"],
                status_code,
                (time.perf_counter() - start) * 1000,
                request_id,
            )


def _request_id(request: Request) -> str | None:
    return getattr(request.state, "request_id", None)


def register_exception_handlers(app: FastAPI) -> None:
    """Every error leaves the API as {"detail": str, "request_id": str}."""

    @app.exception_handler(StarletteHTTPException)
    async def http_error(request: Request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail, "request_id": _request_id(request)},
            headers=getattr(exc, "headers", None),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error(request: Request, exc: RequestValidationError):
        messages = []
        for err in exc.errors():
            field = ".".join(str(part) for part in err["loc"] if part not in ("body", "query", "path"))
            messages.append(f"{field}: {err['msg']}" if field else err["msg"])
        return JSONResponse(
            status_code=422,
            content={"detail": "; ".join(messages), "request_id": _request_id(request)},
        )
