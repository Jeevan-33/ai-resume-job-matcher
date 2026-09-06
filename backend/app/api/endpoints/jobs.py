from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import cast, String
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.job import Job
from app.schemas.job import JobCreate, JobResponse, JobDetailResponse
from app.ml.job_taxonomy import CATEGORIES, classify_category
from app.ml.salary_benchmarks import benchmark_for_job

router = APIRouter()

@router.get("/categories")
def get_categories():
    """The career-branch filter options shown on Browse Jobs."""
    return [{"key": key, "label": label} for key, label in CATEGORIES.items()]

@router.post("/", response_model=JobResponse, status_code=201)
def create_job(job_in: JobCreate, db: Session = Depends(get_db)):
    """Create a new job posting."""
    data = job_in.model_dump()
    if not data.get("category"):
        data["category"] = classify_category(data["title"], data.get("skills"))
    db_job = Job(**data)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.get("/", response_model=list[JobResponse])
def get_jobs(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: str | None = Query(None, description="Search in title, company, description, or skills"),
    category: str | None = Query(None, description="Filter by career branch, e.g. AIML, DS, CS, IS, CY"),
):
    """Get a list of jobs, optionally filtered by a search term and/or category."""
    query = db.query(Job)

    if category:
        query = query.filter(Job.category == category.upper())

    if search:
        # Search title, company, description, and the skills list (cast to
        # text since it's a JSON column) so "React" or "Excel" finds roles
        # that only mention the skill in their tags, not the prose.
        search_term = f"%{search}%"
        query = query.filter(
            Job.title.ilike(search_term)
            | Job.company.ilike(search_term)
            | Job.description.ilike(search_term)
            | cast(Job.skills, String).ilike(search_term)
        )

    return query.offset(skip).limit(limit).all()

@router.get("/{job_id}", response_model=JobDetailResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Get a specific job by its ID, including a real market salary benchmark."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    market_salary = benchmark_for_job(job.title, job.category)

    return JobDetailResponse(
        **JobResponse.model_validate(job).model_dump(),
        market_salary=market_salary,
    )
