from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.job import Job
from app.models.resume import Resume
from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationWithJob

router = APIRouter()


@router.post("/", response_model=ApplicationResponse, status_code=201)
def apply_to_job(
    application_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = db.query(Job).filter(Job.id == application_in.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    resume = (
        db.query(Resume)
        .filter(Resume.id == application_in.resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    existing = (
        db.query(Application)
        .filter(
            Application.job_id == application_in.job_id,
            Application.user_id == current_user.id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="You already applied to this job")

    db_application = Application(
        user_id=current_user.id,
        job_id=application_in.job_id,
        resume_id=application_in.resume_id,
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application


@router.get("/me", response_model=list[ApplicationWithJob])
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    applications = (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .order_by(Application.applied_at.desc())
        .all()
    )
    return [
        ApplicationWithJob(
            id=a.id,
            job_id=a.job_id,
            resume_id=a.resume_id,
            status=a.status,
            applied_at=a.applied_at,
            job_title=a.job.title,
            company=a.job.company,
        )
        for a in applications
    ]
