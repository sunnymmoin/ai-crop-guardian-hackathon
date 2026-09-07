import os
import random
import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

router = APIRouter(tags=["diagnose"])

# ---------------------------------------------------------------------------
# Upload directory
# ---------------------------------------------------------------------------
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/bmp",
    "image/webp",
}


# ---------------------------------------------------------------------------
# Response schema
# ---------------------------------------------------------------------------
class DiagnoseResult(BaseModel):
    filename: str = Field(..., description="Stored filename of the uploaded image")
    disease: str = Field(..., description="Predicted plant disease name")
    confidence: float = Field(..., ge=0, le=1, description="Model confidence (0-1)")
    pesticide: str = Field(..., description="Recommended pesticide")
    dosage: str = Field(..., description="Exact dosage and application instructions")


# ---------------------------------------------------------------------------
# Mock disease database — each entry models a realistic diagnosis
# ---------------------------------------------------------------------------
_DISEASE_DATABASE: list[dict] = [
    {
        "disease": "Late Blight",
        "pesticide": "Mancozeb 75% WP",
        "dosage": "2.5 g/L water — spray every 7-10 days, cover both leaf surfaces",
    },
    {
        "disease": "Powdery Mildew",
        "pesticide": "Sulfur 80% WDG",
        "dosage": "3.0 g/L water — apply at first sign of white patches, repeat after 14 days",
    },
    {
        "disease": "Early Blight",
        "pesticide": "Chlorothalonil 75% WP",
        "dosage": "2.0 g/L water — begin at flowering stage, reapply every 7 days",
    },
    {
        "disease": "Bacterial Leaf Spot",
        "pesticide": "Copper Hydroxide 77% WP",
        "dosage": "1.5 g/L water — spray at 10-day intervals during wet weather",
    },
    {
        "disease": "Downy Mildew",
        "pesticide": "Metalaxyl 35% WS",
        "dosage": "1.0 g/L water — soil drench at transplanting, foliar spray weekly",
    },
    {
        "disease": "Leaf Rust",
        "pesticide": "Propiconazole 25% EC",
        "dosage": "1.0 mL/L water — foliar spray at onset, repeat after 15 days",
    },
    {
        "disease": "Anthracnose",
        "pesticide": "Carbendazim 50% WP",
        "dosage": "1.0 g/L water — apply at fruit-set stage, repeat every 10 days",
    },
    {
        "disease": "Fusarium Wilt",
        "pesticide": "Trichoderma viride (bio-fungicide)",
        "dosage": "5.0 g/L water — soil drench around root zone, repeat monthly",
    },
    {
        "disease": "Septoria Leaf Spot",
        "pesticide": "Azoxystrobin 23% SC",
        "dosage": "0.5 mL/L water — foliar spray at first lesions, reapply after 14 days",
    },
    {
        "disease": "Mosaic Virus",
        "pesticide": "Imidacloprid 17.8% SL (vector control)",
        "dosage": "0.3 mL/L water — spray to control aphid vectors; remove infected plants",
    },
    {
        "disease": "Healthy",
        "pesticide": "None required",
        "dosage": "No treatment needed — continue regular irrigation and fertilization schedule",
    },
]


# ---------------------------------------------------------------------------
# Mock inference function
# ---------------------------------------------------------------------------
def mock_inference(_image_bytes: bytes) -> dict:
    """Simulate an ML model prediction on a leaf image.

    In production, replace this with an actual model call
    (e.g. TensorFlow / PyTorch / ONNX Runtime).
    """
    entry = random.choice(_DISEASE_DATABASE)
    # Healthy samples get higher confidence; diseased samples vary more
    if entry["disease"] == "Healthy":
        confidence = round(random.uniform(0.88, 0.99), 4)
    else:
        confidence = round(random.uniform(0.55, 0.97), 4)

    return {
        "disease": entry["disease"],
        "confidence": confidence,
        "pesticide": entry["pesticide"],
        "dosage": entry["dosage"],
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _validate_file(file: UploadFile) -> str:
    """Return the lower-cased extension if the file is acceptable, else raise."""
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid file type '{ext or '(none)'}'. "
                f"Accepted formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            ),
        )

    if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid MIME type '{file.content_type}'. "
                f"Accepted: {', '.join(sorted(ALLOWED_MIME_TYPES))}"
            ),
        )

    return ext


# ---------------------------------------------------------------------------
# POST /api/diagnose
# ---------------------------------------------------------------------------
@router.post("/diagnose", response_model=DiagnoseResult)
async def diagnose(file: UploadFile = File(...)):
    """Accept a leaf image and return a mock disease diagnosis with pesticide advice."""

    # --- Validate -----------------------------------------------------------
    ext = _validate_file(file)

    # --- Read & persist -----------------------------------------------------
    image_bytes = await file.read()

    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    unique_name = f"{uuid.uuid4().hex}{ext}"
    (UPLOAD_DIR / unique_name).write_bytes(image_bytes)

    # --- Mock inference -----------------------------------------------------
    prediction = mock_inference(image_bytes)

    return DiagnoseResult(
        filename=unique_name,
        disease=prediction["disease"],
        confidence=prediction["confidence"],
        pesticide=prediction["pesticide"],
        dosage=prediction["dosage"],
    )
