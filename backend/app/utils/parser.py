import re

def extract_email(text: str) -> str | None:
    # Matches standard email formats
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    match = re.search(email_pattern, text)
    return match.group(0) if match else None

def extract_phone(text: str) -> str | None:
    # Matches various phone formats: (123) 456-7890, 123-456-7890, etc.
    phone_pattern = r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    match = re.search(phone_pattern, text)
    return match.group(0) if match else None

def extract_sections(text: str) -> dict:
    """
    Slices the resume text into sections based on common headers.
    """
    # Common resume headers
    headers = [
        "SUMMARY", "OBJECTIVE", "EXPERIENCE", "EMPLOYMENT", "WORK HISTORY",
        "EDUCATION", "SKILLS", "PROJECTS", "CERTIFICATIONS", "LANGUAGES"
    ]
    
    # Create a dictionary to hold the results
    sections = {}
    current_header = "UNKNOWN"
    sections[current_header] = []
    
    # Split text line by line
    lines = text.split('\n')
    
    for line in lines:
        clean_line = line.strip()
        if not clean_line:
            continue
            
        # Check if this line is exactly one of our headers (converted to uppercase for matching)
        line_upper = clean_line.upper()
        
        # We assume it's a header if it matches our list and is short (like a title)
        is_header = False
        for header in headers:
            if header in line_upper and len(line_upper) < 30:
                current_header = header
                sections[current_header] = []
                is_header = True
                break
                
        if not is_header:
            sections[current_header].append(clean_line)
            
    # Join the lines back together for each section
    for header in sections:
        sections[header] = "\n".join(sections[header])
        
    return sections

def parse_resume(raw_text: str) -> dict:
    """Master function to run all extractions."""
    return {
        "email": extract_email(raw_text),
        "phone": extract_phone(raw_text),
        "sections": extract_sections(raw_text)
    }