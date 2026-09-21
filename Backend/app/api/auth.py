from beanie.operators import Or
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models import User, UserRole
from app.schemas import (
    LoginRequest,
    MessageResponse,
    OtpSendResponse,
    OtpVerifyRequest,
    RegisterRequest,
    TokenResponse,
    UserMeResponse,
)
from app.services import (
    create_otp,
    driver_application_status,
    get_or_create_profile,
    mask_phone,
    verify_user_otp,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(payload: RegisterRequest):
    phone = payload.phone.strip()
    email = payload.email.lower().strip()

    if await User.find_one(User.phone == phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this phone number already exists.",
        )
    if await User.find_one(User.email == email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    user = User(
        first_name=payload.first_name.strip(),
        email=email,
        phone=phone,
        password_hash=hash_password(payload.password),
        phone_verified=False,
        role=UserRole.DRIVER,
    )
    await user.insert()
    await get_or_create_profile(user.id)

    token = create_access_token(str(user.id), {"role": user.role.value})
    return TokenResponse(
        access_token=token,
        phone_verified=user.phone_verified,
        role=user.role.value,
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    identifier = payload.phone_or_email.strip()
    user = await User.find_one(
        Or(User.phone == identifier, User.email == identifier.lower())
    )
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone/email or password.",
        )

    token = create_access_token(str(user.id), {"role": user.role.value})
    return TokenResponse(
        access_token=token,
        phone_verified=user.phone_verified,
        role=user.role.value,
    )


@router.get("/me", response_model=UserMeResponse)
async def me(user: User = Depends(get_current_user)):
    application_status = None
    if user.role == UserRole.DRIVER:
        application_status = await driver_application_status(user.id)
    return UserMeResponse(
        id=str(user.id),
        email=user.email,
        phone=user.phone,
        first_name=user.first_name,
        phone_verified=user.phone_verified,
        role=user.role.value,
        application_status=application_status,
    )


@router.post("/send-otp", response_model=OtpSendResponse)
async def send_otp(user: User = Depends(get_current_user)):
    if user.phone_verified:
        return OtpSendResponse(
            message="Phone already verified.",
            masked_phone=mask_phone(user.phone),
        )

    _, code = await create_otp(user)
    settings = get_settings()
    response = OtpSendResponse(
        message=f"We've sent a verification code to {mask_phone(user.phone)}.",
        masked_phone=mask_phone(user.phone),
    )
    if settings.is_development and settings.otp_provider == "development":
        response.development_otp = code
    return response


@router.post("/resend-otp", response_model=OtpSendResponse)
async def resend_otp(user: User = Depends(get_current_user)):
    return await send_otp(user=user)


@router.post("/verify-otp", response_model=MessageResponse)
async def verify_otp_endpoint(
    payload: OtpVerifyRequest,
    user: User = Depends(get_current_user),
):
    if user.phone_verified:
        return MessageResponse(message="Phone already verified.")
    await verify_user_otp(user, payload.otp.strip())
    return MessageResponse(message="Phone verified successfully.")
