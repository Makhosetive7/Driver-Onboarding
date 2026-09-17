from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class VehicleUpdate(BaseModel):
    vehicle_type: Literal["MOTORCYCLE", "CAR", "PICKUP", "VAN", "TRUCK"]
    make: str = Field(min_length=1, max_length=100)
    model: str = Field(min_length=1, max_length=100)
    year: int = Field(ge=1980, le=2100)
    registration_number: str = Field(min_length=1, max_length=50)
    colour: str = Field(min_length=1, max_length=50)
    ownership: str = Field(min_length=1, max_length=50)


class VehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    vehicle_type: str | None = None
    make: str | None = None
    model: str | None = None
    year: int | None = None
    registration_number: str | None = None
    colour: str | None = None
    ownership: str | None = None
