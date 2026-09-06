from pydantic import BaseModel
from datetime import datetime


class ResumeResponse(BaseModel):
    id: int
    user_id: int
    file_path: str
    parsed_text: str | None
    contact_email: str | None
    contact_phone: str | None
    candidate_name: str | None = None
    summary: str | None = None
    extracted_data: dict | None
    skills: list[str] | None
    uploaded_at: datetime

    class Config:
        from_attributes = True


class BestMatchPreview(BaseModel):
    job_id: int
    job_title: str
    company: str
    match_score: float
    fit_label: str
    matched_count: int
    missing_count: int


class ResumeUploadResponse(ResumeResponse):
    """What /resumes/upload returns - the parsed resume plus an immediate
    best-fit preview, so the user sees a score without a second click."""
    best_match: BestMatchPreview | None = None
    jobs_considered: int = 0
