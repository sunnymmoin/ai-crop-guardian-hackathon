import io
import logging

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from fastapi.concurrency import run_in_threadpool
from PIL import Image, UnidentifiedImageError
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.errors import PyMongoError

from ..config import Settings, get_settings
from ..db import get_db, utcnow
from ..deps import get_optional_user, predict_rate_limit
from ..services.treatments import UNRECOGNIZED

logger = logging.getLogger("crop_guardian")

router = APIRouter(tags=["diagnose"])

# MPO is how some phone cameras save JPEGs.
ALLOWED_FORMATS = {"JPEG", "MPO", "PNG", "BMP", "WEBP"}


async def read_image(file: UploadFile, max_bytes: int) -> tuple[Image.Image, bytes]:
    """Reject anything that is not a real, reasonably sized image before it reaches the model."""
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file (JPG, PNG or WEBP).")

    data = await file.read(max_bytes + 1)
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(data) > max_bytes:
        raise HTTPException(status_code=413, detail=f"Image is too large. Maximum size is {max_bytes // (1024 * 1024)} MB.")

    try:
        probe = Image.open(io.BytesIO(data))
        image_format = probe.format
        probe.verify()
        image = Image.open(io.BytesIO(data))
        image.load()
    except (UnidentifiedImageError, Image.DecompressionBombError, OSError, SyntaxError):
        raise HTTPException(status_code=400, detail="This file is not a valid image. Please upload a JPG, PNG or WEBP photo.")

    if image_format not in ALLOWED_FORMATS:
        raise HTTPException(status_code=400, detail="Unsupported image format. Please upload a JPG, PNG or WEBP photo.")
    return image, data


@router.post("/predict", dependencies=[Depends(predict_rate_limit)])
async def predict(
    request: Request,
    file: UploadFile = File(...),
    user: dict | None = Depends(get_optional_user),
    db: AsyncDatabase = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    image, data = await read_image(file, settings.max_upload_mb * 1024 * 1024)
    prediction = await run_in_threadpool(request.app.state.predictor.predict, image, data)

    if prediction.class_name is None:
        result = {**UNRECOGNIZED, "class_id": None, "crop": None, "is_healthy": False, "recognized": False}
    else:
        result = {**request.app.state.treatments.lookup(prediction.class_name), "recognized": True}
    result.update(confidence=prediction.confidence, mode=prediction.mode, scan_id=None)

    # Scans are recorded server-side for logged-in farmers, so nobody can log scans for someone else.
    if user is not None and result["recognized"]:
        scan = {
            "user_id": user["_id"],
            "phone": user["phone"],
            "district": user.get("district"),
            "class_id": result["class_id"],
            "crop": result["crop"],
            "disease_en": result["disease_en"],
            "is_healthy": result["is_healthy"],
            "confidence": prediction.confidence,
            "mode": prediction.mode,
            "created_at": utcnow(),
        }
        try:
            inserted = await db.scans.insert_one(scan)
            await db.users.update_one({"_id": user["_id"]}, {"$inc": {"scans": 1}})
            result["scan_id"] = str(inserted.inserted_id)
        except PyMongoError:
            # The farmer still gets the diagnosis even if the database is unreachable.
            logger.exception("Could not save scan for user %s", user["_id"])

    return result
