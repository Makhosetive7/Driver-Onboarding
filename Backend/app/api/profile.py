from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.api.deps import get_verified_driver
from app.models import User
from app.schemas import ProfileResponse, ProfileUpdate
from app.services import get_or_create_profile

router = APIRouter(prefix="/api/driver", tags=["driver"])


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(user: User = Depends(get_verified_driver)):
    profile = await get_or_create_profile(user.id)
    return ProfileResponse(
        first_name=profile.first_name or user.first_name,
        last_name=profile.last_name,
        date_of_birth=profile.date_of_birth,
        gender=profile.gender,
        address=profile.address,
        city=profile.city,
        email=user.email,
        phone=user.phone,
        phone_verified=user.phone_verified,
    )


@router.put("/profile", response_model=ProfileResponse)
async def update_profile(
    payload: ProfileUpdate,
    user: User = Depends(get_verified_driver),
):
    profile = await get_or_create_profile(user.id)
    profile.first_name = payload.first_name.strip()
    profile.last_name = payload.last_name.strip()
    profile.date_of_birth = payload.date_of_birth
    profile.gender = payload.gender
    profile.address = payload.address.strip()
    profile.city = payload.city.strip()
    profile.updated_at = datetime.now(timezone.utc)
    await profile.save()

    user.first_name = profile.first_name
    user.updated_at = datetime.now(timezone.utc)
    await user.save()

    return ProfileResponse(
        first_name=profile.first_name,
        last_name=profile.last_name,
        date_of_birth=profile.date_of_birth,
        gender=profile.gender,
        address=profile.address,
        city=profile.city,
        email=user.email,
        phone=user.phone,
        phone_verified=user.phone_verified,
    )
