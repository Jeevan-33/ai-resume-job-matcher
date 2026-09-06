from pydantic import BaseModel
from datetime import datetime


class ApplicationCreate(BaseModel):
    job_id: int
    resume_id: int


class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    resume_id: int
    status: str
    applied_at: datetime

    class Config:
        from_attributes = True


class ApplicationWithJob(ApplicationResponse):
    job_title: str
    company: str
