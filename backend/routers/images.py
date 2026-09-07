import os
import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

router = APIRouter(tags=["images"])

# Directory where uploaded images are persisted
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


# ---------------------------------------------------------------------------
# Response schema
# ---------------------------------------------------------------------------
class PredictionResult(BaseModel):
    filename: str
    predicted_disease: str
    confidence: float
    recommendation: str


# ---------------------------------------------------------------------------
# POST /api/images/upload
# ---------------------------------------------------------------------------
@router.post("/images/upload", response_model=PredictionResult)
async def upload_image(file: UploadFile = File(...)):
    """Accept a leaf image, persist it, and return a (stub) disease prediction."""

    # --- Validate extension ---------------------------------------------------
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # --- Save file to disk ----------------------------------------------------
    unique_name = f"{uuid.uuid4().hex}{ext}"
    save_path = UPLOAD_DIR / unique_name
    content = await file.read()
    save_path.write_bytes(content)

    # --- Stub prediction (replace with real ML inference later) ---------------
    # TODO: swap this block for an actual model call
    prediction = PredictionResult(
        filename=unique_name,
        predicted_disease="Healthy",
        confidence=0.95,
        recommendation="No disease detected. Continue regular crop maintenance.",
    )

    return prediction
