import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pymongo.errors import PyMongoError

from .config import BACKEND_DIR, get_settings
from .db import create_client, ensure_indexes, normalize_user_phones, seed_crops
from .middleware import RequestContextMiddleware, register_exception_handlers
from .routers import analytics, auth, cultivation, diagnose, health, whatsapp
from .services.predictor import Predictor
from .services.treatments import TreatmentBook

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("crop_guardian")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()

    client = create_client(settings.mongo_uri)
    app.state.db = client[settings.mongo_db]
    try:
        await client.admin.command("ping")
        await ensure_indexes(app.state.db)
        await normalize_user_phones(app.state.db)
        if settings.seed_crops:
            await seed_crops(app.state.db, BACKEND_DIR / "crop_profiles.json")
        logger.info("Connected to MongoDB database '%s'.", settings.mongo_db)
    except PyMongoError as exc:
        # Keep serving (diagnosis still works) and let /api/health report the outage.
        logger.error("MongoDB is not reachable (%s). Check MONGO_URI in backend/.env and restart.", exc)

    app.state.treatments = TreatmentBook(BACKEND_DIR / "disease_treatments.json")
    app.state.predictor = Predictor(
        app.state.treatments.class_names, settings.model_path, settings.confidence_threshold
    )

    yield

    await client.close()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="AI Crop Guardian API", version="2.0.0", lifespan=lifespan)

    # Added innermost first: GZip -> RequestContext -> CORS (outermost).
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(RequestContextMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID", "X-Process-Time"],
    )
    register_exception_handlers(app)

    for module in (health, auth, diagnose, cultivation, analytics, whatsapp):
        app.include_router(module.router, prefix="/api")
    return app


app = create_app()
