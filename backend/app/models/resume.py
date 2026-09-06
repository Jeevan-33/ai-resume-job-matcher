from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_path = Column(String, nullable=False)
    parsed_text = Column(Text, nullable=True)

    # Extracted contact / identity data
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    candidate_name = Column(String, nullable=True)
    summary = Column(Text, nullable=True)  # Profile/objective paragraph pulled from the resume

    extracted_data = Column(JSON, nullable=True)  # Stores our sections
    skills = Column(JSON, nullable=True)  # Canonical skills extracted from the resume

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="resumes")
    applications = relationship("Application", back_populates="resume")
