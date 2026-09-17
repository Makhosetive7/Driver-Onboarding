from datetime import datetime
from typing import Literal

from pydantic import BaseModel

from app.schemas.document import DocumentResponse
from app.schemas.identity import IdentityResponse
from app.schemas.profile import ProfileResponse
from app.schemas.vehicle import VehicleResponse


class ApplicationResponse(BaseModel):
    id: str | None = None
    reference_number: str | None = None
    status: str
    submitted_at: datetime | None = None
    rejection_reason: str | None = None
    first_name: str | None = None


class ApplicationReviewResponse(BaseModel):
    profile: ProfileResponse | None = None
    identity: IdentityResponse | None = None
    vehicle: VehicleResponse | None = None
    documents: list[DocumentResponse] = []
    application: ApplicationResponse


class AdminApplicationSummary(BaseModel):
    id: str
    reference_number: str | None
    status: str
    submitted_at: datetime | None
    first_name: str | None
    last_name: str | None
    phone: str
    email: str
    vehicle_type: str | None
    vehicle_make: str | None
    vehicle_model: str | None


class AdminStatusUpdate(BaseModel):
    status: Literal["APPROVED", "REJECTED"]
    rejection_reason: str | None = None
