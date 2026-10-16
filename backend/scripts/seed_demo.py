"""Insert sample scans and ad campaigns so the B2B dashboard has data to show in a demo.

Run from the backend folder:
    .venv\\Scripts\\python scripts\\seed_demo.py           # add sample data
    .venv\\Scripts\\python scripts\\seed_demo.py --clear   # remove only the sample data
Everything inserted here is tagged is_sample=True; real farmer data is never touched.
"""

import random
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pymongo import MongoClient  # noqa: E402

from app.config import BACKEND_DIR, get_settings  # noqa: E402
from app.services.treatments import TreatmentBook  # noqa: E402

# district: (number of scans, [(class name, weight), ...])
DISTRICTS = {
    "Sukkur": (41, [("Tomato___Early_blight", 6), ("Tomato___healthy", 1), ("Potato___Early_blight", 2)]),
    "Hyderabad": (33, [("Tomato___Leaf_Mold", 4), ("Pepper,_bell___Bacterial_spot", 2), ("Pepper,_bell___healthy", 3)]),
    "Multan": (51, [("Potato___Late_blight", 6), ("Potato___healthy", 2), ("Tomato___Late_blight", 2)]),
    "Shaheed Benazirabad": (19, [("Corn_(maize)___Common_rust", 1), ("Corn_(maize)___healthy", 3)]),
    "Mirpurkhas": (28, [("Tomato___Tomato_Yellow_Leaf_Curl_Virus", 3), ("Tomato___healthy", 3)]),
    "Rahim Yar Khan": (38, [("Corn_(maize)___healthy", 5), ("Potato___healthy", 4), ("Corn_(maize)___Common_rust", 1)]),
}

ADS = [
    {"title": "Sukkur Fertilizer Broadcast", "target_district": "Sukkur", "budget": "Rs. 25,000", "status": "Active"},
    {"title": "Multan Potato Blight Protection", "target_district": "Multan", "budget": "Rs. 40,000", "status": "Active"},
    {"title": "Hyderabad Chili Care Advisory", "target_district": "Hyderabad", "budget": "Rs. 15,000", "status": "Paused"},
]


def main() -> None:
    settings = get_settings()
    client = MongoClient(settings.mongo_uri, tz_aware=True, serverSelectionTimeoutMS=5000)
    db = client[settings.mongo_db]

    if "--clear" in sys.argv:
        scans = db.scans.delete_many({"is_sample": True}).deleted_count
        ads = db.ads.delete_many({"is_sample": True}).deleted_count
        print(f"Removed {scans} sample scans and {ads} sample ads from '{settings.mongo_db}'.")
        return

    book = TreatmentBook(BACKEND_DIR / "disease_treatments.json")
    rng = random.Random(42)
    now = datetime.now(timezone.utc)
    scans = []
    for district, (count, mix) in DISTRICTS.items():
        names, weights = zip(*mix)
        for _ in range(count):
            info = book.lookup(rng.choices(names, weights)[0])
            scans.append({
                "district": district,
                "class_id": info["class_id"],
                "crop": info["crop"],
                "disease_en": info["disease_en"],
                "is_healthy": info["is_healthy"],
                "confidence": round(rng.uniform(0.7, 0.98), 4),
                "mode": "sample",
                "is_sample": True,
                "created_at": now - timedelta(days=rng.uniform(0, 30)),
            })
    db.scans.insert_many(scans)
    db.ads.insert_many([{**ad, "is_sample": True, "created_at": now} for ad in ADS])
    print(f"Inserted {len(scans)} sample scans and {len(ADS)} sample ads into '{settings.mongo_db}'.")


if __name__ == "__main__":
    main()
