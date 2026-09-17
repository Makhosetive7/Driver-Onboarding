from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class ProfileUpdate(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    date_of_birth: date
    gender: str | None = None
    address: str = Field(min_length=1, max_length=255)
    city: str = Field(min_length=1, max_length=100)


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    first_name: str | None
    last_name: str | None
    date_of_birth: date | None
    gender: str | None
    address: str | None
    city: str | None
    email: str
    phone: str
    phone_verified: bool
