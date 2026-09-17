from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    environment: str = "development"
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "takeoff"
    jwt_secret: str = "dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    upload_dir: str = "./uploads"
    max_upload_mb: int = 5

    otp_provider: str = "development"
    otp_api_key: str = ""
    otp_expiry_minutes: int = 5
    otp_max_attempts: int = 5

    admin_email: str = "admin@takeoff.local"
    admin_password: str = "AdminPass123!"
    admin_phone: str = "+263770000001"

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def is_development(self) -> bool:
        return self.environment.lower() in {"development", "dev", "local"}

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def upload_path(self) -> Path:
        path = Path(self.upload_dir)
        path.mkdir(parents=True, exist_ok=True)
        return path


@lru_cache
def get_settings() -> Settings:
    return Settings()
