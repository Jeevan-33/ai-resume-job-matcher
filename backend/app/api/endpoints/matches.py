from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.database import get_db
from app.models.resume import Resume
from app.models.job import Job
from app.ml.matcher import calculate_match_score

router = APIRouter()

# Schema for the output
class MatchResponse(BaseModel):
    job_id: int
    job_title: str
    company: str
    match_score: float

@router.get("/{resume_id}", response_model=list[MatchResponse])
def get_matches_for_resume(resume_id: int, db: Session = Depends(get_db)):
    """Compare a resume against all jobs and return sorted matches."""
    
    # 1. Fetch the Resume
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # 2. Fetch all Jobs
    jobs = db.query(Job).all()
    if not jobs:
        return []

    # 3. Calculate scores
    matches = []
    for job in jobs:
        score = calculate_match_score(resume.parsed_text, job.description)
        matches.append(
            MatchResponse(
                job_id=job.id,
                job_title=job.title,
                company=job.company,
                match_score=score
            )
        )

    # 4. Sort from highest score to lowest
    matches.sort(key=lambda x: x.match_score, reverse=True)
    
    return matches