from pydantic import BaseModel
from datetime import datetime

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    file_path: str
    parsed_text: str | None
    contact_email: str | None
    contact_phone: str | None
    extracted_data: dict | None
    uploaded_at: datetime

    class Config:
        from_attributes = True