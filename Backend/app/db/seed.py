from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from pathlib import Path

from app.core.config import get_settings
from app.core.security import hash_password
from app.models import (
    Application,
    ApplicationStatus,
    Document,
    DocumentStatus,
    DocumentType,
    DriverProfile,
    IdentityType,
    IdentityVerification,
    User,
    UserRole,
    Vehicle,
    VehicleType,
)
from app.services import generate_reference_number, get_or_create_profile

DEMO_DRIVER_PASSWORD = "DriverPass123!"

_MINIMAL_PDF = b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"

DEMO_DRIVERS: list[dict] = [
    {
        "first_name": "Tendai",
        "last_name": "Moyo",
        "email": "tendai.moyo@takeoff.demo",
        "phone": "+263771100001",
        "status": ApplicationStatus.APPROVED,
        "gender": "male",
        "dob": date(1994, 3, 12),
        "address": "12 Samora Machel Avenue",
        "city": "Harare",
        "identity_type": IdentityType.NATIONAL_ID,
        "identity_number": "63-112233-A-12",
        "vehicle": {
            "vehicle_type": VehicleType.CAR,
            "make": "Toyota",
            "model": "Corolla",
            "year": 2018,
            "registration_number": "ABC 1234",
            "colour": "White",
            "ownership": "owned",
        },
    },
    {
        "first_name": "Chiedza",
        "last_name": "Ncube",
        "email": "chiedza.ncube@takeoff.demo",
        "phone": "+263771100002",
        "status": ApplicationStatus.PENDING_REVIEW,
        "gender": "female",
        "dob": date(1996, 7, 21),
        "address": "45 Leopold Takawira Street",
        "city": "Bulawayo",
        "identity_type": IdentityType.NATIONAL_ID,
        "identity_number": "08-445566-B-08",
        "vehicle": {
            "vehicle_type": VehicleType.MOTORCYCLE,
            "make": "Honda",
            "model": "CB125",
            "year": 2021,
            "registration_number": "DEF 5678",
            "colour": "Red",
            "ownership": "owned",
        },
    },
    {
        "first_name": "Farai",
        "last_name": "Dube",
        "email": "farai.dube@takeoff.demo",
        "phone": "+263771100003",
        "status": ApplicationStatus.REJECTED,
        "gender": "male",
        "dob": date(1992, 11, 4),
        "address": "8 Robert Mugabe Way",
        "city": "Gweru",
        "identity_type": IdentityType.PASSPORT,
        "identity_number": "FN1234567",
        "vehicle": {
            "vehicle_type": VehicleType.PICKUP,
            "make": "Nissan",
            "model": "NP300",
            "year": 2016,
            "registration_number": "GHI 9012",
            "colour": "Silver",
            "ownership": "financed",
        },
        "rejection_reason": "Insurance document is expired. Please upload a current policy.",
    },
    {
        "first_name": "Rudo",
        "last_name": "Sibanda",
        "email": "rudo.sibanda@takeoff.demo",
        "phone": "+263771100004",
        "status": ApplicationStatus.DRAFT,
        "complete": False,
    },
]


def _write_placeholder_pdf(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_bytes(_MINIMAL_PDF)


async def seed_admin() -> User:
    settings = get_settings()
    existing = await User.find_one(User.email == settings.admin_email.lower())
    if existing:
        return existing

    admin_user = User(
        first_name="Admin",
        email=settings.admin_email.lower(),
        phone=settings.admin_phone,
        password_hash=hash_password(settings.admin_password),
        phone_verified=True,
        role=UserRole.ADMIN,
    )
    await admin_user.insert()
    return admin_user


async def _seed_complete_driver(
    user: User, profile: DriverProfile, spec: dict, admin: User
) -> None:
    now = datetime.now(timezone.utc)
    settings = get_settings()

    profile.first_name = spec["first_name"]
    profile.last_name = spec["last_name"]
    profile.date_of_birth = spec["dob"]
    profile.gender = spec["gender"]
    profile.address = spec["address"]
    profile.city = spec["city"]
    profile.updated_at = now
    await profile.save()

    identity = await IdentityVerification.find_one(
        IdentityVerification.driver_id == profile.id
    )
    if not identity:
        identity = IdentityVerification(
            driver_id=profile.id,
            identity_type=spec["identity_type"],
            identity_number=spec["identity_number"],
            expiry_date=date.today() + timedelta(days=365 * 5),
        )
        await identity.insert()

    vehicle_spec = spec["vehicle"]
    vehicle = await Vehicle.find_one(Vehicle.driver_id == profile.id)
    if not vehicle:
        vehicle = Vehicle(driver_id=profile.id, **vehicle_spec)
        await vehicle.insert()

    for doc_type in DocumentType:
        existing = await Document.find_one(
            Document.driver_id == profile.id,
            Document.document_type == doc_type,
        )
        if existing:
            continue
        stored_name = f"{profile.id}_{doc_type.value.lower()}.pdf"
        _write_placeholder_pdf(settings.upload_path / stored_name)
        file_url = f"/api/documents/files/{stored_name}"
        await Document(
            driver_id=profile.id,
            document_type=doc_type,
            file_url=file_url,
            file_name=f"{doc_type.value.replace('_', ' ').title()}.pdf",
            status=DocumentStatus.UPLOADED,
        ).insert()
        if doc_type == DocumentType.IDENTITY_DOCUMENT:
            identity.document_url = file_url
            await identity.save()

    application = await Application.find_one(Application.driver_id == profile.id)
    if not application:
        application = Application(driver_id=profile.id)
        await application.insert()

    if application.reference_number:
        return

    status = spec["status"]
    application.reference_number = await generate_reference_number()
    application.status = status
    application.submitted_at = now - timedelta(days=2)
    if status in {ApplicationStatus.APPROVED, ApplicationStatus.REJECTED}:
        application.reviewed_at = now - timedelta(hours=6)
        application.reviewed_by = admin.id
        application.rejection_reason = spec.get("rejection_reason")
    await application.save()


async def seed_demo_drivers(admin: User) -> None:
    for spec in DEMO_DRIVERS:
        email = spec["email"].lower()
        user = await User.find_one(User.email == email)
        if not user:
            user = User(
                first_name=spec["first_name"],
                email=email,
                phone=spec["phone"],
                password_hash=hash_password(DEMO_DRIVER_PASSWORD),
                phone_verified=True,
                role=UserRole.DRIVER,
            )
            await user.insert()
        profile = await get_or_create_profile(user.id)
        if spec.get("complete", True):
            await _seed_complete_driver(user, profile, spec, admin)


async def seed_demo_data() -> None:
    admin = await seed_admin()
    await seed_demo_drivers(admin)


async def main() -> None:
    from app.db.mongo import close_mongo_connection, connect_to_mongo

    await connect_to_mongo()
    try:
        await seed_demo_data()
        users = await User.find_all().to_list()
        print(f"Seed complete. {len(users)} user(s) in database:")
        for user in users:
            print(f"  - {user.role.value:6}  {user.email}  {user.phone}")
    finally:
        await close_mongo_connection()


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
