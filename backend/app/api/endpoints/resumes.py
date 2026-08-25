from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeResponse
from app.utils.file_handler import save_upload_file, extract_text_from_pdf
from app.utils.parser import parse_resume # NEW IMPORT

router = APIRouter()

@router.post("/upload", response_model=ResumeResponse)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_path = save_upload_file(file, current_user.id)
    parsed_text = extract_text_from_pdf(file_path)

    # NEW: Run our parsing engine!
    structured_data = parse_resume(parsed_text)

    db_resume = Resume(
        user_id=current_user.id,
        file_path=file_path,
        parsed_text=parsed_text,
        contact_email=structured_data["email"],        # NEW
        contact_phone=structured_data["phone"],        # NEW
        extracted_data=structured_data["sections"]     # NEW
    )
    
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    return db_resume