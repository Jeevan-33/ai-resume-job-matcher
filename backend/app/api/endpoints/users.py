from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.application import Application
from app.models.resume import Resume
from app.models.user import User
from app.schemas.user import UserCreate, UserProfile, UserResponse
from app.core.security import get_password_hash

router = APIRouter()


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Kept for API compatibility - /auth/register is the one the app uses,
    because it also returns a token."""
    # 1. Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists. Try signing in instead.",
        )

    # 2. Create new user object
    db_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),  # SECURE!
    )

    # 3. Add to database and commit
    db.add(db_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists. Try signing in instead.",
        )
    db.refresh(db_user)  # Get the newly generated ID

    return db_user


@router.get("/me/profile", response_model=UserProfile)
def read_my_profile(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Everything the profile page shows: account details plus activity counts."""
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
        .all()
    )
    application_count = (
        db.query(Application).filter(Application.user_id == current_user.id).count()
    )

    # Roll the skills off every uploaded resume into one de-duplicated list
    skills: list[str] = []
    seen: set[str] = set()
    for resume in resumes:
        for skill in resume.skills or []:
            key = str(skill).strip().lower()
            if key and key not in seen:
                seen.add(key)
                skills.append(str(skill).strip())

    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        created_at=current_user.created_at,
        resume_count=len(resumes),
        application_count=application_count,
        last_resume_at=resumes[0].uploaded_at if resumes else None,
        skills=skills[:40],
    )
