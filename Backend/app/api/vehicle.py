from fastapi import APIRouter, Depends

from app.api.deps import get_verified_driver
from app.models import User, Vehicle, VehicleType
from app.schemas import VehicleResponse, VehicleUpdate
from app.services import get_or_create_profile

router = APIRouter(prefix="/api/driver", tags=["vehicle"])


@router.get("/vehicle", response_model=VehicleResponse)
async def get_vehicle(user: User = Depends(get_verified_driver)):
    profile = await get_or_create_profile(user.id)
    if not profile.vehicle:
        return VehicleResponse()
    v = profile.vehicle
    return VehicleResponse(
        vehicle_type=v.vehicle_type.value,
        make=v.make,
        model=v.model,
        year=v.year,
        registration_number=v.registration_number,
        colour=v.colour,
        ownership=v.ownership,
    )


@router.put("/vehicle", response_model=VehicleResponse)
async def update_vehicle(
    payload: VehicleUpdate,
    user: User = Depends(get_verified_driver),
):
    profile = await get_or_create_profile(user.id)
    vehicle = profile.vehicle
    if not vehicle:
        vehicle = Vehicle(
            driver_id=profile.id,
            vehicle_type=VehicleType(payload.vehicle_type),
            make=payload.make.strip(),
            model=payload.model.strip(),
            year=payload.year,
            registration_number=payload.registration_number.strip().upper(),
            colour=payload.colour.strip(),
            ownership=payload.ownership.strip(),
        )
        await vehicle.insert()
    else:
        vehicle.vehicle_type = VehicleType(payload.vehicle_type)
        vehicle.make = payload.make.strip()
        vehicle.model = payload.model.strip()
        vehicle.year = payload.year
        vehicle.registration_number = payload.registration_number.strip().upper()
        vehicle.colour = payload.colour.strip()
        vehicle.ownership = payload.ownership.strip()
        await vehicle.save()

    profile.vehicle = vehicle
    return VehicleResponse(
        vehicle_type=vehicle.vehicle_type.value,
        make=vehicle.make,
        model=vehicle.model,
        year=vehicle.year,
        registration_number=vehicle.registration_number,
        colour=vehicle.colour,
        ownership=vehicle.ownership,
    )
