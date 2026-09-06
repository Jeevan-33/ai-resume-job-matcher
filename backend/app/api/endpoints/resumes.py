from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeResponse, ResumeUploadResponse, BestMatchPreview
from app.utils.file_handler import save_upload_file, extract_text_from_pdf
from app.utils.parser import parse_resume
from app.services.match_service import compute_matches_for_resume, fit_label_for_score

router = APIRouter()

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10MB, matches the limit shown in the UI


@router.post("/upload", response_model=ResumeUploadResponse)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_path = save_upload_file(file, current_user.id)
    parsed_text = extract_text_from_pdf(file_path)

    if not parsed_text.strip():
        raise HTTPException(
            status_code=422,
            detail="Could not extract any text from this PDF. It may be a scanned image "
            "rather than a text-based PDF - try exporting it directly from a word processor.",
        )

    structured_data = parse_resume(parsed_text)

    db_resume = Resume(
        user_id=current_user.id,
        file_path=file_path,
        parsed_text=parsed_text,
        contact_email=structured_data["email"],
        contact_phone=structured_data["phone"],
        candidate_name=structured_data["name"],
        summary=structured_data["summary"],
        extracted_data=structured_data["sections"],
        skills=structured_data["skills"],
    )

    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    # Give the user an immediate signal - their best-fitting role and score -
    # without a second round trip to /matches.
    matches = compute_matches_for_resume(db, db_resume)
    best_match = None
    if matches:
        top = matches[0]
        best_match = BestMatchPreview(
            job_id=top.job.id,
            job_title=top.job.title,
            company=top.job.company,
            match_score=top.result.overall_score,
            fit_label=fit_label_for_score(top.result.overall_score),
            matched_count=len(top.result.matched_skills),
            missing_count=len(top.result.missing_skills),
        )

    return ResumeUploadResponse(
        **ResumeResponse.model_validate(db_resume).model_dump(),
        best_match=best_match,
        jobs_considered=len(matches),
    )


@router.get("/me", response_model=list[ResumeResponse])
def get_my_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
        .all()
    )
