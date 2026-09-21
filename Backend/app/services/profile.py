from beanie import PydanticObjectId

from app.models import (
    Application,
    ApplicationStatus,
    Document,
    DriverProfile,
    IdentityVerification,
    Vehicle,
)


async def driver_application_status(user_id: PydanticObjectId) -> str:
    profile = await DriverProfile.find_one(DriverProfile.user_id == user_id)
    if not profile:
        return ApplicationStatus.DRAFT.value
    application = await Application.find_one(Application.driver_id == profile.id)
    if not application:
        return ApplicationStatus.DRAFT.value
    return application.status.value


async def get_or_create_profile(user_id: PydanticObjectId) -> DriverProfile:
    profile = await DriverProfile.find_one(DriverProfile.user_id == user_id)
    if profile:
        await hydrate_profile(profile)
        return profile

    profile = DriverProfile(user_id=user_id)
    await profile.insert()
    application = Application(driver_id=profile.id, status=ApplicationStatus.DRAFT)
    await application.insert()
    profile.application = application
    profile.documents = []
    return profile


async def hydrate_profile(profile: DriverProfile) -> DriverProfile:
    profile.identity = await IdentityVerification.find_one(
        IdentityVerification.driver_id == profile.id
    )
    profile.vehicle = await Vehicle.find_one(Vehicle.driver_id == profile.id)
    profile.documents = await Document.find(Document.driver_id == profile.id).to_list()
    profile.application = await Application.find_one(Application.driver_id == profile.id)
    return profile
