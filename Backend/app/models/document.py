from __future__ import annotations

from datetime import datetime, timezone

from beanie import Document as MongoDocument
from beanie import Indexed, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, IndexModel

from app.models.enums import DocumentStatus, DocumentType


class Document(MongoDocument):
    driver_id: Indexed(PydanticObjectId)
    document_type: DocumentType
    file_url: str
    file_name: str
    status: DocumentStatus = DocumentStatus.UPLOADED
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "documents"
        indexes = [
            IndexModel(
                [("driver_id", ASCENDING), ("document_type", ASCENDING)],
                unique=True,
            ),
        ]
