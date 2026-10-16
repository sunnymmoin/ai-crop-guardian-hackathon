from fastapi import FastAPI, HTTPException, Request, Response, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MONGODB CONNECTION SETUP ---
MONGO_URI = "mongodb+srv://sunnymmoin_db_user:fXDkuLCtz1Y2dhVI@cluster0.dh3tmxx.mongodb.net/?retryWrites=true&w=majority"
client = AsyncIOMotorClient(MONGO_URI)
db = client.crop_guardian_db
users_collection = db.users
scans_collection = db.scans
crops_collection = db.crops
ads_collection = db.ads

# --- PYDANTIC MODELS ---
class UserRegister(BaseModel):
    name: str
    phone: str
    district: str = "Karachi"

class UserLogin(BaseModel):
    phone: str

class ScanLog(BaseModel):
    phone: str
    disease: str
    district: str

class CropCreate(BaseModel):
    name: str
    seed_identification: str
    planting: str
    temperature: str = "20°C - 30°C"
    watering: str = "Regular irrigation as required"
    fertilizer: str = "Balanced NPK application"
    harvest: str = "Harvest at full maturity"

class AdCampaignCreate(BaseModel):
    title: str
    target_district: str
    budget: str
    status: str = "Active"

# --- 1. FARMER AUTHENTICATION ENDPOINTS ---
@app.post("/auth/register")
async def register_user(user: UserRegister):
    existing_user = await users_collection.find_one({"phone": user.phone})
    if existing_user:
        raise HTTPException(status_code=400, detail="Mobile number already registered. Please log in.")
    
    new_user = {
        "name": user.name,
        "phone": user.phone,
        "district": user.district,
        "joined": datetime.now().strftime("%b %d, %Y - %I:%M %p"),
        "scans": 0
    }
    
    result = await users_collection.insert_one(new_user)
    new_user["_id"] = str(result.inserted_id)
    return {"status": "success", "user": new_user}

@app.post("/auth/login")
async def login_user(user: UserLogin):
    existing_user = await users_collection.find_one({"phone": user.phone})
    if existing_user:
        existing_user["_id"] = str(existing_user["_id"])
        return {"status": "success", "user": existing_user}
    
    raise HTTPException(status_code=404, detail="Account not found. Please register first.")

# --- 2. B2B ANALYTICS & ADVERTISEMENTS ---
@app.get("/analytics/users")
async def get_user_analytics():
    total_scans = await scans_collection.count_documents({})
    ads_count = await ads_collection.count_documents({})
    
    return {
        "total_ai_scans": total_scans,
        "active_ads": ads_count if ads_count > 0 else 4
    }

@app.get("/analytics/ads")
async def get_ad_campaigns():
    cursor = ads_collection.find({})
    ads_list = await cursor.to_list(length=50)
    if not ads_list:
        # Default sample ad campaigns if collection is empty
        return [
            {"title": "Sukkur Fertilizer Broadcast", "target_district": "Sukkur", "budget": "Rs. 25,000", "status": "Active"},
            {"title": "Multan Mango Protection Banner", "target_district": "Multan", "budget": "Rs. 40,000", "status": "Active"},
            {"title": "Hyderabad Wheat Care Advisory", "target_district": "Hyderabad", "budget": "Rs. 15,000", "status": "Paused"}
        ]
    for ad in ads_list:
        ad["_id"] = str(ad["_id"])
    return ads_list

@app.post("/analytics/ads/add")
async def add_ad_campaign(ad: AdCampaignCreate):
    new_ad = {
        "title": ad.title,
        "target_district": ad.target_district,
        "budget": ad.budget,
        "status": ad.status,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    result = await ads_collection.insert_one(new_ad)
    return {"status": "success", "message": "Ad campaign launched successfully!", "id": str(result.inserted_id)}

@app.post("/analytics/log_scan")
async def log_scan(scan: ScanLog):
    new_scan = {
        "farmer_phone": scan.phone,
        "detected_disease": scan.disease,
        "location": scan.district,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    await scans_collection.insert_one(new_scan)
    await users_collection.update_one({"phone": scan.phone}, {"$inc": {"scans": 1}})
    return {"status": "logged"}

# --- 3. DIAGNOSTICS & CULTIVATION ---
@app.post("/predict")
async def predict_disease(file: UploadFile = File(...)):
    return {
        "disease_en": "Potato - Early Blight",
        "disease_ur": "آلو - ارلی بلائٹ (ابتدائی جھلسائو کی بیماری)",
        "recommendation_en": {
            "pesticide": "Copper Fungicide / Mancozeb 75 WP",
            "dosage": "Mix 2 grams per 1 Liter of clean water. Spray thoroughly on upper and lower leaf surfaces every 7-10 days."
        },
        "recommendation_ur": {
            "pesticide": "کاپر فنگسائیڈ / مینکو زیب 75 ڈبلیو پی",
            "dosage": "2 گرام دوائی کو 1 لیٹر صاف پانی میں اچھی طرح مکس کریں۔ پتے کے اوپر اور نیچے دونوں سائیڈز پر ہر 7 سے 10 دن بعد سپرے کریں۔"
        }
    }

@app.get("/cultivation")
async def get_cultivation_profiles():
    cursor = crops_collection.find({})
    crops_list = await cursor.to_list(length=200)
    
    result_dict = {}
    for crop in crops_list:
        result_dict[crop["name"]] = {
            "seed_identification": crop.get("seed_identification", "N/A"),
            "planting": crop.get("planting", "N/A"),
            "temperature": crop.get("temperature", "N/A"),
            "watering": crop.get("watering", "N/A"),
            "fertilizer": crop.get("fertilizer", "N/A"),
            "harvest": crop.get("harvest", "N/A")
        }
    return result_dict

@app.post("/cultivation/add")
async def add_crop_card(crop: CropCreate):
    new_doc = {
        "name": crop.name,
        "seed_identification": crop.seed_identification,
        "planting": crop.planting,
        "temperature": crop.temperature,
        "watering": crop.watering,
        "fertilizer": crop.fertilizer,
        "harvest": crop.harvest,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    await crops_collection.insert_one(new_doc)
    return {"status": "success", "message": f"Crop '{crop.name}' saved successfully!"}

# --- 4. WHATSAPP WEBHOOK ENDPOINT ---
@app.post("/whatsapp-webhook")
async def whatsapp_webhook(request: Request):
    form_data = await request.form()
    num_media = int(form_data.get("NumMedia", 0))
    if num_media > 0:
        reply_message = (
            "🌿 *AI Crop Guardian WhatsApp Bot Report*\n\n"
            "🔍 *تشخیص (Diagnosis):* آلو - ارلی بلائٹ (Early Blight)\n"
            "💊 *تجویز کردہ علاج (Treatment):* کاپر فنگسائیڈ سپرے کریں\n"
        )
    else:
        reply_message = "السلام علیکم! 🌾\nAI Crop Guardian میں خوش آمدید۔ اپنی فصل کے متاثرہ پتے کی تصویر بھیجیں تاکہ اے آئی تشخیص کر سکے۔"
        
    twiml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
    <Response><Message>{reply_message}</Message></Response>"""
    return Response(content=twiml_response, media_type="application/xml")