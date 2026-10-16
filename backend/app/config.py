from functools import lru_cache
from pathlib import Path
from typing import Annotated

from pydantic import Field, ValidationError, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    """All runtime configuration, read from environment variables or backend/.env.

    Private values (database URI, secrets, admin list) have no default and must be set.
    See backend/.env.example for every setting with an explanation."""

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
        protected_namespaces=("settings_",),
    )

    # --- Database ---
    mongo_uri: str = Field(min_length=1)
    mongo_db: str = "crop_guardian_db"
    seed_crops: bool = True

    # --- Auth ---
    jwt_secret: str = Field(min_length=32)
    jwt_algorithm: str = "HS256"
    jwt_expire_days: int = 30
    admin_phones: Annotated[list[str], NoDecode]
    admin_key: str = Field(min_length=8)

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
    try:
        return Settings()
    except ValidationError as exc:
        problems = []
        for err in exc.errors():
            name = str(err["loc"][0]).upper()
            problems.append(f"{name} is missing" if err["type"] == "missing" else f"{name}: {err['msg']}")
        raise RuntimeError(
            "Backend settings are incomplete: " + "; ".join(problems) + ". "
            f"Copy backend/.env.example to {ENV_FILE} and fill in the values."
        ) from None
