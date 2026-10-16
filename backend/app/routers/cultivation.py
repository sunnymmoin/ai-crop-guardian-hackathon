import re

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.asynchronous.database import AsyncDatabase

from ..db import CROP_FIELDS, get_db, utcnow
from ..deps import get_current_user
from ..schemas import CropIn

router = APIRouter(prefix="/cultivation", tags=["cultivation"])


def _card(doc: dict) -> dict:
    card = {"seed_identification": doc.get("seed_identification") or "N/A", "planting": doc.get("planting") or "N/A"}
    for field in CROP_FIELDS:
        if doc.get(field):
            card[field] = doc[field]
    return card


@router.get("")
async def list_crops(db: AsyncDatabase = Depends(get_db)):
    """Returns {crop name: card}, the shape the Cultivation tab reads."""
    docs = await db.crops.find({"name": {"$nin": [None, ""]}}).sort("name", 1).to_list(length=2000)
    return {doc["name"]: _card(doc) for doc in docs}


@router.post("", status_code=201)
async def add_crop(body: CropIn, user: dict = Depends(get_current_user), db: AsyncDatabase = Depends(get_db)):
    name = body.name.strip()
    name_key = name.lower()
    existing = await db.crops.find_one(
        {"$or": [{"name_key": name_key}, {"name": {"$regex": f"^{re.escape(name)}$", "$options": "i"}}]}
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"'{name}' is already in the crop database.")

    doc = {
        "name": name,
        "name_key": name_key,
        **{field: value.strip() for field, value in body.model_dump(exclude={"name"}).items() if value and value.strip()},
        "source": "user",
        "created_by": user["_id"],
        "created_at": utcnow(),
    }
    await db.crops.insert_one(doc)
    return {"message": f"Crop '{name}' saved successfully!", "crop": {name: _card(doc)}}
