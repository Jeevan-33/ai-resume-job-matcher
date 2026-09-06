from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from passlib.exc import UnknownHashError
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except (UnknownHashError, ValueError):
        # Stored hash isn't a valid bcrypt hash (e.g. corrupted/legacy data) -
        # treat as a failed login instead of crashing the request.
        return False

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# app/core/security.py (Update just this function)

def create_access_token(subject: str | int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt