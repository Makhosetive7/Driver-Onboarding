from __future__ import annotations

from datetime import datetime, timezone

from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel

from app.models.enums import ApplicationStatus


class Application(Document):
    driver_id: Indexed(PydanticObjectId, unique=True)
    reference_number: str | None = None
    status: ApplicationStatus = ApplicationStatus.DRAFT
    submitted_at: datetime | None = None
    reviewed_at: datetime | None = None
    reviewed_by: PydanticObjectId | None = None
    rejection_reason: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "applications"
        indexes = [
            IndexModel(
                [("reference_number", ASCENDING)],
                unique=True,
                sparse=True,
            ),
        ]
