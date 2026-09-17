from __future__ import annotations

from datetime import datetime, timezone

from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field

from app.models.enums import VehicleType


class Vehicle(Document):
    driver_id: Indexed(PydanticObjectId, unique=True)
    vehicle_type: VehicleType
    make: str
    model: str
    year: int
    registration_number: str
    colour: str
    ownership: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "vehicles"
