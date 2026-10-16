from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError

router = APIRouter(tags=["health"])


@router.get("/health")
async def health(request: Request):
    try:
        await request.app.state.db.client.admin.command("ping")
        database = "up"
    except PyMongoError:
        database = "down"
    body = {
        "status": "ok" if database == "up" else "degraded",
        "database": database,
        "model_mode": request.app.state.predictor.mode,
    }
    return JSONResponse(body, status_code=200 if database == "up" else 503)
