from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.job import Job
from app.schemas.job import JobCreate, JobResponse

router = APIRouter()

@router.post("/", response_model=JobResponse, status_code=201)
def create_job(job_in: JobCreate, db: Session = Depends(get_db)):
    """Create a new job posting."""
    db_job = Job(**job_in.model_dump())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.get("/", response_model=list[JobResponse])
def get_jobs(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: str | None = Query(None, description="Search in title or description")
):
    """Get a list of jobs, optionally filtered by a search term."""
    query = db.query(Job)
    
    if search:
        # Search for the term in the title OR description (case-insensitive)
        search_term = f"%{search}%"
        query = query.filter(
            Job.title.ilike(search_term) | Job.description.ilike(search_term)
        )
        
    return query.offset(skip).limit(limit).all()

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Get a specific job by its ID."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job