from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    email: EmailStr  # EmailStr automatically validates it has an @ symbol

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        # Normalize so signup/login can never mismatch on case or stray whitespace
        return v.strip().lower()

# Properties to receive on user creation
class UserCreate(UserBase):
    # bcrypt silently truncates anything past 72 bytes, so reject it up front
    # instead of letting the user set a password we can't fully verify later.
    password: str = Field(min_length=8, max_length=72)
    full_name: str | None = Field(default=None, max_length=120)

    @field_validator("password")
    @classmethod
    def password_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Password cannot be blank")
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password is too long (max 72 bytes)")
        return v

    @field_validator("full_name")
    @classmethod
    def clean_full_name(cls, v: str | None) -> str | None:
        if v is None:
            return None
        cleaned = v.strip()
        return cleaned or None

# Properties to return to client
class UserResponse(UserBase):
    id: int
    full_name: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True  # Tells Pydantic to read data even if it's a SQLAlchemy model

# Everything the profile page needs, in one round trip
class UserProfile(UserResponse):
    resume_count: int = 0
    application_count: int = 0
    last_resume_at: datetime | None = None
    skills: list[str] = []

# What the login/register endpoints hand back
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse | None = None
