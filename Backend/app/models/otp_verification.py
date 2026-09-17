from __future__ import annotations

from datetime import datetime, timezone

from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field


class OtpVerification(Document):
    user_id: Indexed(PydanticObjectId)
    otp_hash: str
    expires_at: datetime
    attempts: int = 0
    verified_at: datetime | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "otp_verifications"
