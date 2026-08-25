from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    company = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=True)
    
    # NEW FIELDS
    employment_type = Column(String, nullable=True)  # Full-time, Part-time, Contract
    experience_level = Column(String, nullable=True) # Entry, Mid, Senior
    salary_range = Column(String, nullable=True)
    source = Column(String, nullable=True)           # e.g., "Internal", "LinkedIn"
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())