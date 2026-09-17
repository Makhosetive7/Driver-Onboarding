from __future__ import annotations

import enum


class ApplicationStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class IdentityType(str, enum.Enum):
    NATIONAL_ID = "NATIONAL_ID"
    PASSPORT = "PASSPORT"
    DRIVERS_LICENCE = "DRIVERS_LICENCE"


class VehicleType(str, enum.Enum):
    MOTORCYCLE = "MOTORCYCLE"
    CAR = "CAR"
    PICKUP = "PICKUP"
    VAN = "VAN"
    TRUCK = "TRUCK"


class DocumentType(str, enum.Enum):
    DRIVERS_LICENCE = "DRIVERS_LICENCE"
    IDENTITY_DOCUMENT = "IDENTITY_DOCUMENT"
    VEHICLE_REGISTRATION = "VEHICLE_REGISTRATION"
    INSURANCE = "INSURANCE"
    ROADWORTHINESS = "ROADWORTHINESS"


class DocumentStatus(str, enum.Enum):
    UPLOADED = "UPLOADED"
    PENDING = "PENDING"


class UserRole(str, enum.Enum):
    DRIVER = "DRIVER"
    ADMIN = "ADMIN"
