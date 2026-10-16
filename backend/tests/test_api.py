import asyncio
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.deps import RateLimiter
from conftest import ADMIN_KEY, ADMIN_PHONE, auth_header, make_png, register


def test_health_and_request_headers(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "up", "model_mode": "demo"}
    assert response.headers["X-Request-ID"]
    assert response.headers["X-Process-Time"].endswith("ms")


def test_register_login_me_with_phone_normalization(client):
    created = register(client, "0300 1234567")
    assert created.status_code == 201
    assert created.json()["user"]["phone"] == "03001234567"
    assert created.json()["user"]["role"] == "farmer"

    duplicate = register(client, "+92 300 1234567")
    assert duplicate.status_code == 409

    login = client.post("/api/auth/login", json={"phone": "923001234567"})
    assert login.status_code == 200
    token = login.json()["token"]

    me = client.get("/api/auth/me", headers=auth_header(token))
    assert me.status_code == 200
    assert me.json()["phone"] == "03001234567"


def test_auth_errors_share_one_shape(client):
    missing = client.get("/api/auth/me")
    assert missing.status_code == 401
    assert set(missing.json()) == {"detail", "request_id"}

    garbage = client.get("/api/auth/me", headers=auth_header("not-a-token"))
    assert garbage.status_code == 401

    unknown = client.post("/api/auth/login", json={"phone": "03220000000"})
    assert unknown.status_code == 404

    invalid = client.post("/api/auth/register", json={"name": "x"})
    assert invalid.status_code == 422
    assert isinstance(invalid.json()["detail"], str)

    short = register(client, "123")
    assert short.status_code == 422


def test_admin_guard(client, farmer_token, admin_token):
    assert client.get("/api/analytics/summary").status_code == 401
    assert client.get("/api/analytics/summary", headers=auth_header(farmer_token)).status_code == 403
    assert client.get("/api/analytics/summary", headers=auth_header(admin_token)).status_code == 200

    # The admin phone without the key is just a farmer; a wrong key is rejected.
    plain = client.post("/api/auth/login", json={"phone": ADMIN_PHONE})
    assert plain.json()["user"]["role"] == "farmer"
    wrong = client.post("/api/auth/login", json={"phone": ADMIN_PHONE, "admin_key": "nope"})
    assert wrong.status_code == 401
    # The right key on a phone that is not in ADMIN_PHONES is also rejected.
    other = client.post("/api/auth/login", json={"phone": "03111111111", "admin_key": ADMIN_KEY})
    assert other.status_code == 401


def test_predict_demo_mode(client):
    image = make_png()
    first = client.post("/api/predict", files={"file": ("leaf.png", image, "image/png")})
    assert first.status_code == 200
    body = first.json()
    assert body["mode"] == "demo"
    assert body["confidence"] is None
    assert body["recognized"] is True
    assert body["disease_en"] and body["disease_ur"]
    assert body["recommendation_ur"]["pesticide"]
    assert body["scan_id"] is None  # anonymous scans are not stored

    again = client.post("/api/predict", files={"file": ("leaf.png", image, "image/png")})
    assert again.json()["class_id"] == body["class_id"]


def test_predict_rejects_non_images(client):
    text = client.post("/api/predict", files={"file": ("notes.txt", b"hello", "text/plain")})
    assert text.status_code == 400
    fake = client.post("/api/predict", files={"file": ("leaf.jpg", b"not really a jpeg", "image/jpeg")})
    assert fake.status_code == 400
    empty = client.post("/api/predict", files={"file": ("leaf.png", b"", "image/png")})
    assert empty.status_code == 400


def test_cultivation_seed_and_add(client, farmer_token):
    crops = client.get("/api/cultivation").json()
    assert len(crops) == 100
    assert crops["Tomato"]["sunlight"]

    card = {"name": "Moringa", "seed_identification": "Round, winged brown seed", "planting": "3 m apart"}
    assert client.post("/api/cultivation", json=card).status_code == 401
    assert client.post("/api/cultivation", json=card, headers=auth_header(farmer_token)).status_code == 201
    duplicate = client.post("/api/cultivation", json={**card, "name": "moringa"}, headers=auth_header(farmer_token))
    assert duplicate.status_code == 409
    assert len(client.get("/api/cultivation").json()) == 101


def test_scans_feed_heatmap_and_summary(client, admin_token):
    token = register(client, "03334444444", district="Sukkur").json()["token"]
    for shade in range(3):
        response = client.post(
            "/api/predict",
            files={"file": ("leaf.png", make_png((10 * shade, 120, 40)), "image/png")},
            headers=auth_header(token),
        )
        assert response.json()["scan_id"]

    heatmap = client.get("/api/analytics/heatmap", headers=auth_header(admin_token)).json()
    sukkur = next(row for row in heatmap if row["district"] == "Sukkur")
    assert sukkur["scans"] == 3
    assert sukkur["level"] in {"low", "med", "high"}

    summary = client.get("/api/analytics/summary", headers=auth_header(admin_token)).json()
    assert summary["total_scans"] >= 3
    me = client.get("/api/auth/me", headers=auth_header(token)).json()
    assert me["scans"] == 3


def test_ads_admin_only(client, farmer_token, admin_token):
    ad = {"title": "Sukkur Fertilizer Promo", "target_district": "Sukkur", "budget": "Rs. 20,000"}
    assert client.post("/api/ads", json=ad, headers=auth_header(farmer_token)).status_code == 403
    created = client.post("/api/ads", json=ad, headers=auth_header(admin_token))
    assert created.status_code == 201
    titles = [item["title"] for item in client.get("/api/ads", headers=auth_header(admin_token)).json()]
    assert ad["title"] in titles


def test_rate_limiter_blocks_after_limit():
    limiter = RateLimiter("rate_limit_auth_per_min")
    request = SimpleNamespace(client=SimpleNamespace(host="1.2.3.4"), url=SimpleNamespace(path="/api/auth/login"))
    settings = SimpleNamespace(rate_limit_auth_per_min=2)

    async def hit():
        await limiter(request, settings)

    asyncio.run(hit())
    asyncio.run(hit())
    with pytest.raises(HTTPException) as blocked:
        asyncio.run(hit())
    assert blocked.value.status_code == 429
