import io
import os

# Must be set before the app is imported; environment variables take priority over backend/.env.
os.environ.update({
    "MONGO_URI": os.environ.get("TEST_MONGO_URI", "mongodb://localhost:27017"),
    "MONGO_DB": "crop_guardian_test",
    "JWT_SECRET": "test-secret-that-is-at-least-32-bytes-long",
    "ADMIN_PHONES": "03009999999",
    "ADMIN_KEY": "test-admin-key",
    "RATE_LIMIT_AUTH_PER_MIN": "1000",
    "RATE_LIMIT_PREDICT_PER_MIN": "1000",
    "MODEL_PATH": "missing-model-for-tests.pt",
})

import pytest
from fastapi.testclient import TestClient
from PIL import Image
from pymongo import MongoClient

from app.main import app

ADMIN_PHONE = "03009999999"
ADMIN_KEY = "test-admin-key"


@pytest.fixture(scope="session")
def client():
    mongo = MongoClient(os.environ["MONGO_URI"], serverSelectionTimeoutMS=3000)
    mongo.drop_database("crop_guardian_test")
    with TestClient(app) as test_client:
        yield test_client
    mongo.drop_database("crop_guardian_test")
    mongo.close()


def make_png(color=(34, 139, 34), size=(64, 64)) -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", size, color).save(buffer, format="PNG")
    return buffer.getvalue()


def register(client, phone, name="Test Farmer", district="Multan", admin_key=None):
    body = {"name": name, "phone": phone, "district": district}
    if admin_key:
        body["admin_key"] = admin_key
    return client.post("/api/auth/register", json=body)


def auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="session")
def farmer_token(client):
    return register(client, "03111111111", district="Multan").json()["token"]


@pytest.fixture(scope="session")
def admin_token(client):
    return register(client, ADMIN_PHONE, name="Admin", district="Karachi", admin_key=ADMIN_KEY).json()["token"]
