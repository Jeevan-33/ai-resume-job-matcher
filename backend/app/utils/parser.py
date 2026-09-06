import re
from app.ml.skills import extract_skills

EMAIL_RE = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')

# Prefer a phone number that's explicitly labeled - resumes routinely have
# other 10+ digit numbers (graduation years, pin codes, IDs) that a bare
# digit-pattern search would false-positive on.
PHONE_LABEL_RE = re.compile(
    r'(?:phone|mobile|cell|contact|tel(?:ephone)?)\s*(?:no\.?|number)?\s*[:\-]?\s*'
    r'([+(]?\d[\d\s().+-]{7,}\d)',
    re.IGNORECASE,
)
# Fallback: any run of digits/separators that, once stripped, is a plausible
# phone length (10-13 digits - covers local US and +country-code formats).
PHONE_GENERIC_RE = re.compile(r'(\+?\d{1,3}[-.\s]?)?(\(?\d{2,5}\)?[-.\s]?){2,4}\d{3,4}')

# Header aliases -> canonical section name. Longer/more specific phrases are
# listed first so "TECHNICAL SKILLS" doesn't get shadowed by a later, looser
# match - the caller does substring containment, not exact matching.
SECTION_HEADERS = [
    "PROFESSIONAL SUMMARY", "CAREER OBJECTIVE", "CAREER SUMMARY",
    "SUMMARY", "PROFILE", "OBJECTIVE", "ABOUT ME", "ABOUT",
    "EXPERIENCE", "EMPLOYMENT", "WORK HISTORY",
    "EDUCATION", "SKILLS", "PROJECTS", "CERTIFICATIONS",
    "CORE COMPETENCIES", "COMPETENCIES", "LANGUAGES",
]

# Which of the section names above count as a "summary" a human wrote,
# checked in priority order.
SUMMARY_SECTION_PRIORITY = [
    "PROFESSIONAL SUMMARY", "CAREER SUMMARY", "SUMMARY", "PROFILE",
    "CAREER OBJECTIVE", "OBJECTIVE", "ABOUT ME", "ABOUT",
]


def extract_email(text: str) -> str | None:
    match = EMAIL_RE.search(text)
    return match.group(0) if match else None


def extract_phone(text: str) -> str | None:
    if not text:
        return None

    candidate = None
    labeled = PHONE_LABEL_RE.search(text)
    if labeled:
        candidate = labeled.group(1)
    else:
        for match in PHONE_GENERIC_RE.finditer(text):
            digits = re.sub(r"\D", "", match.group(0))
            if 10 <= len(digits) <= 13:
                candidate = match.group(0)
                break

    if not candidate:
        return None

    digits = re.sub(r"\D", "", candidate)
    if not (10 <= len(digits) <= 13):
        return None

    return candidate.strip(" -")


def extract_name(text: str) -> str | None:
    """Best-effort candidate name: resumes conventionally lead with it.

    Heuristic - the first non-empty line, if it looks like a name (short,
    no @ or digits, 1-4 words) rather than a tagline or contact line.
    """
    if not text:
        return None
    for line in text.split("\n"):
        clean = line.strip(" \t\u2022-")
        if not clean:
            continue
        if "@" in clean or any(ch.isdigit() for ch in clean):
            return None
        words = clean.split()
        if 1 <= len(words) <= 4 and len(clean) <= 60:
            return clean.title() if clean.isupper() else clean
        return None
    return None


def extract_sections(text: str) -> dict:
    """Slices the resume text into sections based on common headers."""
    sections: dict[str, list[str]] = {"UNKNOWN": []}
    current_header = "UNKNOWN"

    for line in text.split("\n"):
        clean_line = line.strip()
        if not clean_line:
            continue

        line_upper = clean_line.upper()
        is_header = False
        if len(line_upper) < 40:
            for header in SECTION_HEADERS:
                if header in line_upper:
                    current_header = header
                    sections.setdefault(current_header, [])
                    is_header = True
                    break

        if not is_header:
            sections[current_header].append(clean_line)

    return {header: "\n".join(lines) for header, lines in sections.items()}


def extract_summary(sections: dict, max_length: int = 500) -> str | None:
    """Pull the human-written summary/profile/objective paragraph, if present."""
    for header in SUMMARY_SECTION_PRIORITY:
        # PDF line wraps show up as literal newlines mid-sentence - collapse
        # them so the summary reads as prose instead of a jagged column.
        text = re.sub(r"\s+", " ", sections.get(header, "")).strip()
        if len(text) >= 40:
            return text[:max_length].rsplit(" ", 1)[0] if len(text) > max_length else text
    return None


def parse_resume(raw_text: str) -> dict:
    """Master function to run all extractions."""
    sections = extract_sections(raw_text)
    return {
        "email": extract_email(raw_text),
        "phone": extract_phone(raw_text),
        "name": extract_name(raw_text),
        "summary": extract_summary(sections),
        "sections": sections,
        "skills": extract_skills(raw_text),
    }
