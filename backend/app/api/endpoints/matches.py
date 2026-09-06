from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.database import get_db
from app.models.resume import Resume
from app.ml.learning_paths import skill_summary
from app.services.match_service import (
    compute_matches_for_resume,
    fit_label_for_score,
    gap_summary_for,
    skill_gap_summary,
)

router = APIRouter()


class MissingSkillDetail(BaseModel):
    skill: str
    summary: str


class MatchItem(BaseModel):
    job_id: int
    job_title: str
    company: str
    location: str | None = None
    employment_type: str | None = None
    experience_level: str | None = None
    salary_range: str | None = None
    apply_url: str | None = None
    match_score: float
    skill_score: float
    text_score: float
    fit_label: str
    matched_skills: list[str]
    missing_skills: list[str]
    missing_skills_detail: list[MissingSkillDetail]
    gap_summary: str


class SkillGap(BaseModel):
    skill: str
    frequency: int


class MatchesResponse(BaseModel):
    resume_id: int
    candidate_name: str | None
    resume_summary: str | None
    detected_skills: list[str]
    jobs_considered: int
    best_match: MatchItem | None
    skill_gap_summary: list[SkillGap]
    matches: list[MatchItem]


def _to_match_item(job_match) -> MatchItem:
    job, result = job_match.job, job_match.result
    return MatchItem(
        job_id=job.id,
        job_title=job.title,
        company=job.company,
        location=job.location,
        employment_type=job.employment_type,
        experience_level=job.experience_level,
        salary_range=job.salary_range,
        apply_url=job.apply_url,
        match_score=result.overall_score,
        skill_score=result.skill_score,
        text_score=result.text_score,
        fit_label=fit_label_for_score(result.overall_score),
        matched_skills=result.matched_skills,
        missing_skills=result.missing_skills,
        missing_skills_detail=[
            MissingSkillDetail(skill=s, summary=skill_summary(s)) for s in result.missing_skills
        ],
        gap_summary=gap_summary_for(result),
    )


@router.get("/{resume_id}", response_model=MatchesResponse)
def get_matches_for_resume(resume_id: int, db: Session = Depends(get_db)):
    """Compare a resume against every job posting and return a ranked,
    explained list: what matches, what's missing, and what to learn next."""

    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    job_matches = compute_matches_for_resume(db, resume)
    match_items = [_to_match_item(jm) for jm in job_matches]

    return MatchesResponse(
        resume_id=resume.id,
        candidate_name=resume.candidate_name,
        resume_summary=resume.summary,
        detected_skills=resume.skills or [],
        jobs_considered=len(match_items),
        best_match=match_items[0] if match_items else None,
        skill_gap_summary=[SkillGap(**gap) for gap in skill_gap_summary(job_matches)],
        matches=match_items,
    )
