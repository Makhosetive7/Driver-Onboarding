from __future__ import annotations

from datetime import datetime, timezone

from beanie import Document, Indexed
from pydantic import Field

from app.models.enums import UserRole


class User(Document):
    phone: Indexed(str, unique=True)
    email: Indexed(str, unique=True)
    password_hash: str
    first_name: str
    phone_verified: bool = False
    role: UserRole = UserRole.DRIVER
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
