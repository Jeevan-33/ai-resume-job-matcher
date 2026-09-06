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
    skills: list[str] | None = None
    apply_url: str | None = None
    category: str | None = None

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class MarketSalary(BaseModel):
    occupation: str
    median_annual: int
    source: str
    source_url: str
    period: str


class JobDetailResponse(JobResponse):
    """What clicking into a job shows: everything JobResponse has, plus a
    real market salary benchmark for context alongside the posting's own
    salary_range."""
    market_salary: MarketSalary
