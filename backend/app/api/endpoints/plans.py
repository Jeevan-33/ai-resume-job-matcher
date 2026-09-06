from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.job import Job
from app.models.resume import Resume
from app.models.user import User
from app.ml.matcher import calculate_match
from app.ml.learning_paths import build_plan

router = APIRouter()


@router.get("/job/{job_id}")
def get_job_plan(job_id: int, db: Session = Depends(get_db)):
    """A learning plan covering every skill a job requires - used from
    Browse Jobs, where there's no resume in context yet."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    skills = job.skills or []
    if not skills:
        raise HTTPException(
            status_code=422,
            detail="This job posting doesn't list specific required skills to build a plan from.",
        )

    plan = build_plan(skills, target_label=f"{job.title} at {job.company}")
    plan["job_id"] = job.id
    plan["job_title"] = job.title
    plan["company"] = job.company
    plan["mode"] = "full_role"
    return plan


@router.get("/gap/{resume_id}/{job_id}")
def get_gap_plan(
    resume_id: int,
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """A learning plan covering only the skills a specific resume is missing
    for a specific job - used from the Dashboard match cards."""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if resume.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This resume doesn't belong to you.")

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    result = calculate_match(
        resume_text=resume.parsed_text,
        job_description=job.description,
        job_skills=job.skills,
        resume_skills=resume.skills,
    )

    if not result.missing_skills:
        return {
            "job_id": job.id,
            "job_title": job.title,
            "company": job.company,
            "mode": "gap",
            "target_label": f"{job.title} at {job.company}",
            "total_estimated_weeks": 0,
            "step_count": 0,
            "steps": [],
            "message": "You already match every required skill for this role - no gap plan needed.",
        }

    plan = build_plan(result.missing_skills, target_label=f"{job.title} at {job.company}")
    plan["job_id"] = job.id
    plan["job_title"] = job.title
    plan["company"] = job.company
    plan["resume_id"] = resume.id
    plan["mode"] = "gap"
    return plan
