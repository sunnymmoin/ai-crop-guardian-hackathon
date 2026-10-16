import re
from collections import Counter

from fastapi import APIRouter, Depends
from pymongo.asynchronous.database import AsyncDatabase

from ..db import get_db, iso, utcnow
from ..deps import require_admin
from ..schemas import AdIn

# Every route here is admin-only.
router = APIRouter(tags=["analytics"], dependencies=[Depends(require_admin)])

# From the app's economics card: Rs. 95,000 revenue at risk minus Rs. 3,000 treatment, per acre.
NET_SAVED_PER_ACRE_PKR = 92_000

# Older scans (before this backend) used farmer_phone / detected_disease / location.
_LEGACY_DISEASED = {"is_healthy": {"$exists": False}, "detected_disease": {"$not": re.compile("healthy", re.I)}}


@router.get("/analytics/summary")
async def summary(db: AsyncDatabase = Depends(get_db)):
    diseased = await db.scans.count_documents({"$or": [{"is_healthy": False}, _LEGACY_DISEASED]})
    return {
        "total_scans": await db.scans.count_documents({}),
        "diseased_scans": diseased,
        "registered_farmers": await db.users.count_documents({}),
        "active_ads": await db.ads.count_documents({"status": "Active"}),
        "estimated_saved_pkr": diseased * NET_SAVED_PER_ACRE_PKR,
        "estimate_basis": "Rs. 92,000 net saved per acre, assuming one acre treated per diseased scan.",
    }


@router.get("/analytics/heatmap")
async def heatmap(db: AsyncDatabase = Depends(get_db)):
    """Disease spread per district, built from real scans."""
    pipeline = [
        {"$project": {
            "district": {"$ifNull": ["$district", "$location"]},
            "disease": {"$ifNull": ["$disease_en", "$detected_disease"]},
            "crop": "$crop",
            "is_healthy": "$is_healthy",
        }},
        {"$match": {"district": {"$nin": [None, ""]}}},
        {"$group": {
            "_id": {"district": "$district", "disease": "$disease", "crop": "$crop", "is_healthy": "$is_healthy"},
            "count": {"$sum": 1},
        }},
    ]
    districts: dict[str, dict] = {}
    async for group in await db.scans.aggregate(pipeline):
        key, count = group["_id"], group["count"]
        disease = key.get("disease") or "Unknown"
        healthy = key.get("is_healthy")
        if healthy is None:
            healthy = "healthy" in disease.lower()
        entry = districts.setdefault(key["district"], {"total": 0, "diseased": 0, "diseases": Counter(), "crops": Counter()})
        entry["total"] += count
        entry["crops"][key.get("crop") or disease.split(" - ")[0]] += count
        if not healthy:
            entry["diseased"] += count
            entry["diseases"][disease] += count

    rows = []
    for district, entry in districts.items():
        severity = round(100 * entry["diseased"] / entry["total"])
        top_disease = entry["diseases"].most_common(1)
        rows.append({
            "district": district,
            "crop": " & ".join(crop for crop, _ in entry["crops"].most_common(2)),
            "disease": top_disease[0][0] if top_disease else "Healthy / Low Risk",
            "severity": severity,
            "level": "high" if severity >= 60 else "med" if severity >= 30 else "low",
            "scans": entry["total"],
        })
    rows.sort(key=lambda row: row["scans"], reverse=True)
    return rows


def _ad(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "title": doc.get("title", ""),
        "target_district": doc.get("target_district", ""),
        "budget": doc.get("budget", ""),
        "status": doc.get("status", "Active"),
        "created_at": iso(doc.get("created_at")),
    }


@router.get("/ads")
async def list_ads(db: AsyncDatabase = Depends(get_db)):
    docs = await db.ads.find({}).sort("_id", -1).to_list(length=200)
    return [_ad(doc) for doc in docs]


@router.post("/ads", status_code=201)
async def create_ad(body: AdIn, admin: dict = Depends(require_admin), db: AsyncDatabase = Depends(get_db)):
    doc = {**body.model_dump(), "created_by": admin["_id"], "created_at": utcnow()}
    result = await db.ads.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"message": "Ad campaign launched successfully!", "ad": _ad(doc)}
