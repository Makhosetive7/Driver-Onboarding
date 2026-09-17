from __future__ import annotations

from datetime import date, datetime, timezone

from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field, PrivateAttr


class DriverProfile(Document):
    user_id: Indexed(PydanticObjectId, unique=True)
    first_name: str | None = None
    last_name: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    address: str | None = None
    city: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    _identity: object | None = PrivateAttr(default=None)
    _vehicle: object | None = PrivateAttr(default=None)
    _documents: list = PrivateAttr(default_factory=list)
    _application: object | None = PrivateAttr(default=None)

    @property
    def identity(self):
        return self._identity

    @identity.setter
    def identity(self, value) -> None:
        self._identity = value

    @property
    def vehicle(self):
        return self._vehicle

    @vehicle.setter
    def vehicle(self, value) -> None:
        self._vehicle = value

    @property
    def documents(self) -> list:
        return self._documents

    @documents.setter
    def documents(self, value: list) -> None:
        self._documents = value

    @property
    def application(self):
        return self._application

    @application.setter
    def application(self, value) -> None:
        self._application = value

    class Settings:
        name = "driver_profiles"
