from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.core.security import get_password_hash

router = APIRouter()

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system."
        )
    
    # 2. Create new user object 
    db_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password)  # SECURE!
    )
    
    # 3. Add to database and commit
    db.add(db_user)
    db.commit()
    db.refresh(db_user) # Get the newly generated ID
    
    return db_user