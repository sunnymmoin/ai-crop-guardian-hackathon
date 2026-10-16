from functools import lru_cache
from pathlib import Path
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """All runtime configuration. The defaults below run the project as-is, with no .env file.
    Any value can still be overridden with an environment variable of the same name."""

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        protected_namespaces=("settings_",),
    )

    # --- Database (the team's shared MongoDB Atlas cluster) ---
    mongo_uri: str = "mongodb+srv://sunnymmoin_db_user:fXDkuLCtz1Y2dhVI@cluster0.dh3tmxx.mongodb.net/?retryWrites=true&w=majority"
    mongo_db: str = "crop_guardian_db"
    seed_crops: bool = True

    # --- Auth (demo credentials, listed in README) ---
    jwt_secret: str = "ai-crop-guardian-demo-jwt-secret-2026"
    jwt_algorithm: str = "HS256"
    jwt_expire_days: int = 30
    admin_phones: Annotated[list[str], NoDecode] = ["03000000001"]
    admin_key: str = "cropguardian-admin-2026"

    # --- HTTP ---
    cors_origins: Annotated[list[str], NoDecode] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    rate_limit_auth_per_min: int = 10
    rate_limit_predict_per_min: int = 30

    # --- AI model ---
    model_path: Path = BACKEND_DIR / "crop_model.pt"
    confidence_threshold: float = 0.5
    max_upload_mb: int = 5

    @field_validator("admin_phones", "cors_origins", mode="before")
    @classmethod
    def _split_csv(cls, value):
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @field_validator("model_path")
    @classmethod
    def _relative_to_backend(cls, value: Path) -> Path:
        return value if value.is_absolute() else BACKEND_DIR / value


@lru_cache
def get_settings() -> Settings:
    return Settings()
