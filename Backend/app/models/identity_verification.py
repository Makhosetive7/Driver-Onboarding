from __future__ import annotations

from datetime import date, datetime, timezone

from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field

from app.models.enums import IdentityType


class IdentityVerification(Document):
    driver_id: Indexed(PydanticObjectId, unique=True)
    identity_type: IdentityType
    identity_number: str
    expiry_date: date | None = None
    document_url: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "identity_verifications"
