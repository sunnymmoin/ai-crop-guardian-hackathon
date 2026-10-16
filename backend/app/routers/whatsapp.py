from fastapi import APIRouter, Request, Response

router = APIRouter(prefix="/whatsapp", tags=["whatsapp"])


@router.post("/webhook")
async def whatsapp_webhook(request: Request):
    """Placeholder Twilio webhook. Real diagnosis over WhatsApp needs Twilio credentials (not set up yet)."""
    form_data = await request.form()
    num_media = int(form_data.get("NumMedia", 0) or 0)
    if num_media > 0:
        reply_message = (
            "🌿 *AI Crop Guardian*\n\n"
            "تصویر موصول ہو گئی۔ واٹس ایپ پر تشخیص جلد شروع ہو گی، ابھی ویب ایپ استعمال کریں۔\n"
            "Photo received. WhatsApp diagnosis is coming soon; please use the web app for now."
        )
    else:
        reply_message = "السلام علیکم! 🌾\nAI Crop Guardian میں خوش آمدید۔ اپنی فصل کے متاثرہ پتے کی تصویر بھیجیں تاکہ اے آئی تشخیص کر سکے۔"

    twiml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response><Message>{reply_message}</Message></Response>"""
    return Response(content=twiml_response, media_type="application/xml")
