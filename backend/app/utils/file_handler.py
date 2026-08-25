import os
import shutil
from fastapi import UploadFile
import PyPDF2

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True) # Ensures the folder exists

def save_upload_file(upload_file: UploadFile, user_id: int) -> str:
    # We prefix the filename with the user_id to prevent naming collisions
    safe_filename = upload_file.filename.replace(" ", "_")
    file_name = f"user_{user_id}_{safe_filename}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    # Copy the file from memory to our hard drive
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
        
    return file_path

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        with open(file_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text