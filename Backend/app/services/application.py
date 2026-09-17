from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.models import (
    Application,
    ApplicationStatus,
    DocumentType,
    DriverProfile,
)
from app.services.profile import hydrate_profile

REQUIRED_DOCUMENTS = {
    DocumentType.DRIVERS_LICENCE,
    DocumentType.IDENTITY_DOCUMENT,
    DocumentType.VEHICLE_REGISTRATION,
    DocumentType.INSURANCE,
    DocumentType.ROADWORTHINESS,
}


async def get_or_create_application(profile: DriverProfile) -> Application:
    if profile.application:
        return profile.application
    application = Application(driver_id=profile.id, status=ApplicationStatus.DRAFT)
    await application.insert()
    profile.application = application
    return application


async def generate_reference_number() -> str:
    year = datetime.now(timezone.utc).year
    count = await Application.find(
        Application.reference_number != None  # noqa: E711
    ).count()
    return f"TO-{year}-{count + 1:05d}"


def validate_for_submission(profile: DriverProfile) -> None:
    missing: list[str] = []

    if not profile.first_name or not profile.last_name or not profile.date_of_birth:
        missing.append("personal details")
    if not profile.address or not profile.city:
        missing.append("address")
    if not profile.identity:
        missing.append("identity information")
    else:
        has_id_doc = any(
            d.document_type == DocumentType.IDENTITY_DOCUMENT for d in profile.documents
        ) or bool(profile.identity.document_url)
        if not has_id_doc:
            missing.append("identity document upload")
    if not profile.vehicle:
        missing.append("vehicle details")

    uploaded_types = {d.document_type for d in profile.documents}
    missing_docs = REQUIRED_DOCUMENTS - uploaded_types
    if missing_docs:
        missing.append(
            "documents: " + ", ".join(sorted(d.value for d in missing_docs))
        )

    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application is incomplete. Please complete: " + "; ".join(missing),
        )


async def submit_application(profile: DriverProfile) -> Application:
    await hydrate_profile(profile)
    validate_for_submission(profile)
    application = await get_or_create_application(profile)

    if application.status not in {ApplicationStatus.DRAFT, ApplicationStatus.REJECTED}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application has already been submitted.",
        )

    if not application.reference_number:
        application.reference_number = await generate_reference_number()

    application.status = ApplicationStatus.PENDING_REVIEW
    application.submitted_at = datetime.now(timezone.utc)
    application.rejection_reason = None
    await application.save()
    return application
