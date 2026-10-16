"""Fill the database with demo users, scans, ad campaigns and crop cards.

Run from the backend folder:
    .venv\\Scripts\\python scripts\\seed.py           # add (or refresh) the demo data
    .venv\\Scripts\\python scripts\\seed.py --clear   # remove only the demo data

Every row written here is tagged is_sample=True, so real farmer data is never touched.
Running it again replaces the old demo scans and ads instead of duplicating them.
"""

import asyncio
import random
import sys
from datetime import timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pymongo.asynchronous.database import AsyncDatabase  # noqa: E402
from pymongo.errors import PyMongoError  # noqa: E402

from app.config import BACKEND_DIR, get_settings  # noqa: E402
from app.db import create_client, ensure_indexes, seed_crops, utcnow  # noqa: E402
from app.services.treatments import TreatmentBook  # noqa: E402

# Log in with the phone number only. The admin also types ADMIN_KEY (see README).
ADMIN = {"name": "Crop Guardian Admin", "phone": "03000000001", "district": "Karachi"}

# Each farmer gets `scans` diagnoses drawn from their district's disease mix (class name, weight).
FARMERS = [
    {"name": "Ghulam Rasool", "phone": "03000000002", "district": "Multan", "scans": 24,
     "mix": [("Potato___Late_blight", 6), ("Potato___healthy", 2), ("Tomato___Late_blight", 2)]},
    {"name": "Ayesha Bibi", "phone": "03000000003", "district": "Sukkur", "scans": 20,
     "mix": [("Tomato___Early_blight", 6), ("Tomato___healthy", 1), ("Potato___Early_blight", 2)]},
    {"name": "Muhammad Akram", "phone": "03000000004", "district": "Hyderabad", "scans": 16,
     "mix": [("Tomato___Leaf_Mold", 4), ("Pepper,_bell___Bacterial_spot", 2), ("Pepper,_bell___healthy", 3)]},
    {"name": "Rukhsana Parveen", "phone": "03000000005", "district": "Mirpurkhas", "scans": 14,
     "mix": [("Tomato___Tomato_Yellow_Leaf_Curl_Virus", 3), ("Tomato___healthy", 3)]},
    {"name": "Abdul Sattar", "phone": "03000000006", "district": "Rahim Yar Khan", "scans": 18,
     "mix": [("Corn_(maize)___healthy", 5), ("Potato___healthy", 4), ("Corn_(maize)___Common_rust", 1)]},
    {"name": "Nasreen Akhtar", "phone": "03000000007", "district": "Shaheed Benazirabad", "scans": 10,
     "mix": [("Corn_(maize)___Common_rust", 1), ("Corn_(maize)___healthy", 3)]},
]

ADS = [
    {"title": "Sukkur Fertilizer Broadcast", "target_district": "Sukkur", "budget": "Rs. 25,000", "status": "Active"},
    {"title": "Multan Potato Blight Protection", "target_district": "Multan", "budget": "Rs. 40,000", "status": "Active"},
    {"title": "Hyderabad Chili Care Advisory", "target_district": "Hyderabad", "budget": "Rs. 15,000", "status": "Paused"},
]


async def clear(db: AsyncDatabase) -> dict:
    return {
        "users": (await db.users.delete_many({"is_sample": True})).deleted_count,
        "scans": (await db.scans.delete_many({"is_sample": True})).deleted_count,
        "ads": (await db.ads.delete_many({"is_sample": True})).deleted_count,
    }


async def _upsert_user(db: AsyncDatabase, person: dict, now) -> dict | None:
    """Create or refresh a demo user. Returns None if a real account already owns the phone."""
    existing = await db.users.find_one({"phone": person["phone"]})
    if existing and not existing.get("is_sample"):
        print(f"  skipped {person['phone']}: a real account already uses this number")
        return None
    await db.users.update_one(
        {"phone": person["phone"]},
        {"$set": {"name": person["name"], "district": person["district"], "is_sample": True},
         "$setOnInsert": {"created_at": now, "scans": 0}},
        upsert=True,
    )
    return await db.users.find_one({"phone": person["phone"]})


async def seed(db: AsyncDatabase) -> dict:
    await ensure_indexes(db)
    crops = await seed_crops(db, BACKEND_DIR / "crop_profiles.json")

    # Replace earlier demo scans and ads so re-running never duplicates them.
    await db.scans.delete_many({"is_sample": True})
    await db.ads.delete_many({"is_sample": True})

    book = TreatmentBook(BACKEND_DIR / "disease_treatments.json")
    rng = random.Random(42)
    now = utcnow()
    users = 0
    scans = []

    if await _upsert_user(db, ADMIN, now):
        users += 1

    for farmer in FARMERS:
        user = await _upsert_user(db, farmer, now)
        if user is None:
            continue
        users += 1
        names, weights = zip(*farmer["mix"])
        for _ in range(farmer["scans"]):
            info = book.lookup(rng.choices(names, weights)[0])
            scans.append({
                "user_id": user["_id"],
                "phone": user["phone"],
                "district": farmer["district"],
                "class_id": info["class_id"],
                "crop": info["crop"],
                "disease_en": info["disease_en"],
                "is_healthy": info["is_healthy"],
                "confidence": round(rng.uniform(0.7, 0.98), 4),
                "mode": "sample",
                "is_sample": True,
                "created_at": now - timedelta(days=rng.uniform(0, 30)),
            })
        await db.users.update_one({"_id": user["_id"]}, {"$set": {"scans": farmer["scans"]}})

    if scans:
        await db.scans.insert_many(scans)
    await db.ads.insert_many([{**ad, "is_sample": True, "created_at": now} for ad in ADS])
    return {"users": users, "scans": len(scans), "ads": len(ADS), "crops_added": crops}


async def main() -> None:
    settings = get_settings()
    client = create_client(settings.mongo_uri)
    db = client[settings.mongo_db]
    try:
        try:
            await client.admin.command("ping")
        except PyMongoError as exc:
            print(f"Cannot reach MongoDB ({type(exc).__name__}).")
            print("If you use Atlas: Atlas > Network Access > Add IP Address, allow this computer's IP, then run again.")
            sys.exit(1)
        if "--clear" in sys.argv:
            removed = await clear(db)
            print(f"Removed demo data from '{settings.mongo_db}': {removed}")
        else:
            added = await seed(db)
            print(f"Seeded '{settings.mongo_db}': {added}")
    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(main())
