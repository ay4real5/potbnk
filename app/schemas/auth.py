import uuid
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 1800  # 30 minutes in seconds


class UserProfile(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    created_at: str
    role: str = "user"
    is_admin: bool = False

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
