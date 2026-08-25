from pydantic import BaseModel
from datetime import datetime

class JobBase(BaseModel):
    title: str
    company: str
    description: str
    location: str | None = None
    employment_type: str | None = None
    experience_level: str | None = None
    salary_range: str | None = None
    source: str | None = "Internal"

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True