from fastapi import APIRouter, Depends

from app.api.deps import get_verified_driver
from app.models import ApplicationStatus, User
from app.schemas import (
    ApplicationResponse,
    ApplicationReviewResponse,
    DocumentResponse,
    IdentityResponse,
    ProfileResponse,
    VehicleResponse,
)
from app.services import (
    get_or_create_application,
    get_or_create_profile,
    submit_application,
)

router = APIRouter(prefix="/api/application", tags=["application"])


def _build_review(user: User, profile) -> ApplicationReviewResponse:
    application = profile.application
    status = application.status.value if application else ApplicationStatus.DRAFT.value

    identity_resp = None
    if profile.identity:
        identity_resp = IdentityResponse(
            identity_type=profile.identity.identity_type.value,
            identity_number=profile.identity.identity_number,
            expiry_date=profile.identity.expiry_date,
            document_url=profile.identity.document_url,
            has_document=bool(profile.identity.document_url),
        )

    vehicle_resp = None
    if profile.vehicle:
        v = profile.vehicle
        vehicle_resp = VehicleResponse(
            vehicle_type=v.vehicle_type.value,
            make=v.make,
            model=v.model,
            year=v.year,
            registration_number=v.registration_number,
            colour=v.colour,
            ownership=v.ownership,
        )

    return ApplicationReviewResponse(
        profile=ProfileResponse(
            first_name=profile.first_name or user.first_name,
            last_name=profile.last_name,
            date_of_birth=profile.date_of_birth,
            gender=profile.gender,
            address=profile.address,
            city=profile.city,
            email=user.email,
            phone=user.phone,
            phone_verified=user.phone_verified,
        ),
        identity=identity_resp,
        vehicle=vehicle_resp,
        documents=[
            DocumentResponse(
                id=str(d.id),
                document_type=d.document_type.value,
                file_name=d.file_name,
                file_url=d.file_url,
                status=d.status.value,
                uploaded_at=d.uploaded_at,
            )
            for d in profile.documents
        ],
        application=ApplicationResponse(
            id=str(application.id) if application else None,
            reference_number=application.reference_number if application else None,
            status=status,
            submitted_at=application.submitted_at if application else None,
            rejection_reason=application.rejection_reason if application else None,
            first_name=profile.first_name or user.first_name,
        ),
    )


@router.get("", response_model=ApplicationReviewResponse)
async def get_application(user: User = Depends(get_verified_driver)):
    profile = await get_or_create_profile(user.id)
    await get_or_create_application(profile)
    return _build_review(user, profile)


@router.post("/submit", response_model=ApplicationResponse)
async def submit(user: User = Depends(get_verified_driver)):
    profile = await get_or_create_profile(user.id)
    application = await submit_application(profile)
    return ApplicationResponse(
        id=str(application.id),
        reference_number=application.reference_number,
        status=application.status.value,
        submitted_at=application.submitted_at,
        rejection_reason=application.rejection_reason,
        first_name=profile.first_name or user.first_name,
    )
