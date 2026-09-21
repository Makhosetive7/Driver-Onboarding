from pydantic import BaseModel, EmailStr, Field, field_validator


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    phone_verified: bool
    role: str


class RegisterRequest(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(min_length=8, max_length=32)
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info):
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords must match")
        return v


class LoginRequest(BaseModel):
    phone_or_email: str
    password: str


class OtpSendResponse(BaseModel):
    message: str
    masked_phone: str
    development_otp: str | None = None


class OtpVerifyRequest(BaseModel):
    otp: str = Field(min_length=6, max_length=6)


class MessageResponse(BaseModel):
    message: str


class UserMeResponse(BaseModel):
    id: str
    email: str
    phone: str
    first_name: str
    phone_verified: bool
    role: str
    application_status: str | None = None
