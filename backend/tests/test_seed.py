import asyncio
import os

from pymongo import AsyncMongoClient

import seed as seeder
from conftest import ADMIN_KEY, auth_header


def on_test_db(action):
    """Run an async seeder function against the test database."""
    async def run():
        client = AsyncMongoClient(os.environ["MONGO_URI"], tz_aware=True)
        try:
            return await action(client[os.environ["MONGO_DB"]])
        finally:
            await client.close()
    return asyncio.run(run())


def test_seeder_creates_demo_users_and_can_rerun(client):
    expected_scans = sum(farmer["scans"] for farmer in seeder.FARMERS)

    first = on_test_db(seeder.seed)
    assert first["users"] == 1 + len(seeder.FARMERS)
    assert first["scans"] == expected_scans

    on_test_db(seeder.seed)  # running twice must not duplicate anything
    assert on_test_db(lambda db: db.scans.count_documents({"is_sample": True})) == expected_scans
    assert on_test_db(lambda db: db.ads.count_documents({"is_sample": True})) == len(seeder.ADS)

    admin = client.post("/api/auth/login", json={"phone": seeder.ADMIN["phone"], "admin_key": ADMIN_KEY})
    assert admin.status_code == 200
    assert admin.json()["user"]["role"] == "admin"

    farmer = seeder.FARMERS[0]
    login = client.post("/api/auth/login", json={"phone": farmer["phone"]})
    assert login.status_code == 200
    assert login.json()["user"]["scans"] == farmer["scans"]

    heatmap = client.get("/api/analytics/heatmap", headers=auth_header(admin.json()["token"])).json()
    assert farmer["district"] in {row["district"] for row in heatmap}


def test_seeder_clear_removes_only_demo_data(client):
    on_test_db(seeder.seed)
    real_users_before = on_test_db(lambda db: db.users.count_documents({"is_sample": {"$ne": True}}))

    removed = on_test_db(seeder.clear)
    assert removed["users"] == 1 + len(seeder.FARMERS)
    assert on_test_db(lambda db: db.users.count_documents({"is_sample": {"$ne": True}})) == real_users_before
    assert client.post("/api/auth/login", json={"phone": seeder.FARMERS[0]["phone"]}).status_code == 404
