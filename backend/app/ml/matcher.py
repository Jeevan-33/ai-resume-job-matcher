from dataclasses import dataclass, field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.ml.skills import extract_skills

SKILL_WEIGHT = 0.65
TEXT_WEIGHT = 0.35

EXPERIENCE_ORDER = {"entry": 0, "mid": 1, "senior": 2, "lead": 3}


@dataclass
class MatchResult:
    overall_score: float
    skill_score: float
    text_score: float
    matched_skills: list[str] = field(default_factory=list)
    missing_skills: list[str] = field(default_factory=list)


def _text_similarity(resume_text: str, job_description: str) -> float:
    if not resume_text or not job_description:
        return 0.0
    vectorizer = TfidfVectorizer(stop_words="english")
    try:
        tfidf_matrix = vectorizer.fit_transform([resume_text, job_description])
    except ValueError:
        # Happens if both documents are only stop words / empty after cleaning
        return 0.0
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    return round(float(similarity) * 100, 2)


def calculate_match(
    resume_text: str,
    job_description: str,
    job_skills: list[str] | None = None,
    resume_skills: list[str] | None = None,
) -> MatchResult:
    """
    Score a resume against a job using a hybrid signal:
      - skill_score: how much of what the job requires is actually present
        in the resume (recall over job_skills) - this drives matched/missing.
      - text_score: whole-document TF-IDF cosine similarity, a secondary
        semantic signal that still rewards relevant experience not captured
        by the fixed taxonomy.
    """
    resume_skills = resume_skills if resume_skills is not None else extract_skills(resume_text)
    job_skills = job_skills if job_skills is not None else extract_skills(job_description)

    text_score = _text_similarity(resume_text, job_description)

    resume_skill_set = set(resume_skills)
    job_skill_set = set(job_skills)

    if job_skill_set:
        # Preserve the order skills were authored in job_skills (language ->
        # framework -> tooling) rather than alphabetizing, so anything built
        # on top of this - a learning plan, a UI list - reads as a sensible
        # sequence instead of shuffled letters.
        seen = set()
        ordered_job_skills = [s for s in job_skills if not (s in seen or seen.add(s))]
        matched = [s for s in ordered_job_skills if s in resume_skill_set]
        missing = [s for s in ordered_job_skills if s not in resume_skill_set]
        skill_score = round((len(matched) / len(job_skill_set)) * 100, 2)
    else:
        matched, missing = [], []
        skill_score = text_score

    overall = round((skill_score * SKILL_WEIGHT) + (text_score * TEXT_WEIGHT), 2)

    return MatchResult(
        overall_score=overall,
        skill_score=skill_score,
        text_score=text_score,
        matched_skills=matched,
        missing_skills=missing,
    )


def calculate_match_score(resume_text: str, job_description: str) -> float:
    """Backwards-compatible helper returning just the overall score."""
    return calculate_match(resume_text, job_description).overall_score
