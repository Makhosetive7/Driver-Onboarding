from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class IdentityUpdate(BaseModel):
    identity_type: Literal["NATIONAL_ID", "PASSPORT", "DRIVERS_LICENCE"]
    identity_number: str = Field(min_length=1, max_length=100)
    expiry_date: date | None = None


class IdentityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    identity_type: str | None = None
    identity_number: str | None = None
    expiry_date: date | None = None
    document_url: str | None = None
    has_document: bool = False
