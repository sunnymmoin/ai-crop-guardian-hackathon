import json
import logging
from datetime import datetime, timezone
from pathlib import Path

from fastapi import Request
from pymongo import ASCENDING, DESCENDING, AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.errors import DuplicateKeyError

from .security import normalize_phone

logger = logging.getLogger("crop_guardian")

CROP_FIELDS = ("seed_identification", "planting", "sunlight", "temperature", "watering", "fertilizer", "harvest")


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def get_db(request: Request) -> AsyncDatabase:
    return request.app.state.db


async def ensure_indexes(db: AsyncDatabase) -> None:
    await db.users.create_index("phone", unique=True)
    await db.scans.create_index([("district", ASCENDING), ("created_at", DESCENDING)])
    await db.scans.create_index("user_id")
    await db.crops.create_index("name_key", unique=True, sparse=True)


async def normalize_user_phones(db: AsyncDatabase) -> None:
    """Older data stored phones as typed ('0300 1234567'). Rewrite them to the normalized form."""
    async for user in db.users.find({}, {"phone": 1}):
        normalized = normalize_phone(user["phone"])
        if normalized and normalized != user["phone"]:
            try:
                await db.users.update_one({"_id": user["_id"]}, {"$set": {"phone": normalized}})
            except DuplicateKeyError:
                logger.warning("Skipped phone cleanup for user %s: %s is already taken.", user["_id"], normalized)


async def seed_crops(db: AsyncDatabase, profiles_path: Path) -> int:
    """Load crop_profiles.json into an empty crops collection. Never touches existing data."""
    if await db.crops.estimated_document_count() > 0:
        return 0
    profiles = json.loads(profiles_path.read_text(encoding="utf-8"))
    now = utcnow()
    docs = [
        {
            "name": name,
            "name_key": name.strip().lower(),
            **{field: info[field] for field in CROP_FIELDS if info.get(field)},
            "source": "seed",
            "created_at": now,
        }
        for name, info in profiles.items()
    ]
    if docs:
        await db.crops.insert_many(docs)
    logger.info("Seeded %d crops from %s", len(docs), profiles_path.name)
    return len(docs)


def iso(value) -> str | None:
    """Datetimes become ISO strings; legacy string timestamps from older data pass through unchanged."""
    if isinstance(value, datetime):
        return value.isoformat()
    return value


def serialize_user(doc: dict, role: str = "farmer") -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name", "Registered Farmer"),
        "phone": doc["phone"],
        "district": doc.get("district", "Karachi"),
        "scans": doc.get("scans", 0),
        "joined": iso(doc.get("created_at") or doc.get("joined")),
        "role": role,
    }


def create_client(uri: str) -> AsyncMongoClient:
    return AsyncMongoClient(uri, tz_aware=True, serverSelectionTimeoutMS=5000)
