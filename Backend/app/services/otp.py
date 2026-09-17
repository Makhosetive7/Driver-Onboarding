import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status

from app.core.config import get_settings
from app.core.security import hash_otp, verify_otp
from app.models import OtpVerification, User


def mask_phone(phone: str) -> str:
    digits = "".join(c for c in phone if c.isdigit() or c == "+")
    if len(digits) < 6:
        return phone
    return f"{digits[:4]} XX XXX {digits[-3:]}"


def generate_otp_code() -> str:
    settings = get_settings()
    if settings.is_development and settings.otp_provider == "development":
        return "123456"
    return f"{secrets.randbelow(1_000_000):06d}"


async def create_otp(user: User) -> tuple[OtpVerification, str]:
    settings = get_settings()
    code = generate_otp_code()
    record = OtpVerification(
        user_id=user.id,
        otp_hash=hash_otp(code),
        expires_at=datetime.now(timezone.utc)
        + timedelta(minutes=settings.otp_expiry_minutes),
        attempts=0,
    )
    await record.insert()
    return record, code


async def verify_user_otp(user: User, code: str) -> None:
    settings = get_settings()
    record = (
        await OtpVerification.find(
            OtpVerification.user_id == user.id,
            OtpVerification.verified_at == None,  # noqa: E711
        )
        .sort(-OtpVerification.created_at)
        .first_or_none()
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No verification code found. Please request a new one.",
        )

    expires = record.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) > expires:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new one.",
        )

    if record.attempts >= settings.otp_max_attempts:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many incorrect attempts. Please request a new code.",
        )

    if not verify_otp(code, record.otp_hash):
        record.attempts += 1
        await record.save()
        remaining = settings.otp_max_attempts - record.attempts
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Incorrect code. {remaining} attempt(s) remaining.",
        )

    record.verified_at = datetime.now(timezone.utc)
    await record.save()
    user.phone_verified = True
    user.updated_at = datetime.now(timezone.utc)
    await user.save()
