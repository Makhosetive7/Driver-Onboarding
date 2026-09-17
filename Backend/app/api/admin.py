from datetime import datetime, timezone

from beanie.operators import In
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_admin_user, parse_object_id
from app.models import (
    Application,
    ApplicationStatus,
    DriverProfile,
    User,
)
from app.schemas import (
    AdminApplicationSummary,
    AdminStatusUpdate,
    ApplicationResponse,
    ApplicationReviewResponse,
    DocumentResponse,
    IdentityResponse,
    MessageResponse,
    ProfileResponse,
    VehicleResponse,
)
from app.services import hydrate_profile

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/applications", response_model=list[AdminApplicationSummary])
async def list_applications(_: User = Depends(get_admin_user)):
    apps = (
        await Application.find_all()
        .sort(-Application.submitted_at, -Application.id)
        .to_list()
    )
    if not apps:
        return []

    driver_ids = [app.driver_id for app in apps]
    drivers = await DriverProfile.find(In(DriverProfile.id, driver_ids)).to_list()
    driver_map = {d.id: d for d in drivers}

    user_ids = [d.user_id for d in drivers]
    users = await User.find(In(User.id, user_ids)).to_list()
    user_map = {u.id: u for u in users}

    from app.models import Vehicle

    vehicles = await Vehicle.find(In(Vehicle.driver_id, driver_ids)).to_list()
    vehicle_map = {v.driver_id: v for v in vehicles}

    results: list[AdminApplicationSummary] = []
    for app in apps:
        driver = driver_map.get(app.driver_id)
        if not driver:
            continue
        user = user_map.get(driver.user_id)
        if not user:
            continue
        vehicle = vehicle_map.get(driver.id)
        results.append(
            AdminApplicationSummary(
                id=str(app.id),
                reference_number=app.reference_number,
                status=app.status.value,
                submitted_at=app.submitted_at,
                first_name=driver.first_name or user.first_name,
                last_name=driver.last_name,
                phone=user.phone,
                email=user.email,
                vehicle_type=vehicle.vehicle_type.value if vehicle else None,
                vehicle_make=vehicle.make if vehicle else None,
                vehicle_model=vehicle.model if vehicle else None,
            )
        )
    return results


@router.get("/applications/{application_id}", response_model=ApplicationReviewResponse)
async def get_application_detail(
    application_id: str,
    _: User = Depends(get_admin_user),
):
    app = await Application.get(parse_object_id(application_id))
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    driver = await DriverProfile.get(app.driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found.")
    await hydrate_profile(driver)
    user = await User.get(driver.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    identity_resp = None
    if driver.identity:
        identity_resp = IdentityResponse(
            identity_type=driver.identity.identity_type.value,
            identity_number=driver.identity.identity_number,
            expiry_date=driver.identity.expiry_date,
            document_url=driver.identity.document_url,
            has_document=bool(driver.identity.document_url),
        )
    vehicle_resp = None
    if driver.vehicle:
        v = driver.vehicle
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
            first_name=driver.first_name or user.first_name,
            last_name=driver.last_name,
            date_of_birth=driver.date_of_birth,
            gender=driver.gender,
            address=driver.address,
            city=driver.city,
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
            for d in driver.documents
        ],
        application=ApplicationResponse(
            id=str(app.id),
            reference_number=app.reference_number,
            status=app.status.value,
            submitted_at=app.submitted_at,
            rejection_reason=app.rejection_reason,
            first_name=driver.first_name or user.first_name,
        ),
    )


@router.patch("/applications/{application_id}/status", response_model=MessageResponse)
async def update_status(
    application_id: str,
    payload: AdminStatusUpdate,
    admin: User = Depends(get_admin_user),
):
    app = await Application.get(parse_object_id(application_id))
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    if app.status != ApplicationStatus.PENDING_REVIEW:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only applications under review can be approved or rejected.",
        )

    new_status = ApplicationStatus(payload.status)
    if new_status == ApplicationStatus.REJECTED and not (
        payload.rejection_reason and payload.rejection_reason.strip()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A rejection reason is required.",
        )

    app.status = new_status
    app.reviewed_at = datetime.now(timezone.utc)
    app.reviewed_by = admin.id
    app.rejection_reason = (
        payload.rejection_reason.strip()
        if new_status == ApplicationStatus.REJECTED
        else None
    )
    await app.save()
    return MessageResponse(message=f"Application marked as {new_status.value}.")
