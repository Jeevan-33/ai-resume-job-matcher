from pydantic import BaseModel, EmailStr
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    email: EmailStr  # EmailStr automatically validates it has an @ symbol

# Properties to receive on user creation
class UserCreate(UserBase):
    password: str

# Properties to return to client
class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # Tells Pydantic to read data even if it's a SQLAlchemy model