"""
Shared resume<->job matching logic used by both the /resumes/upload endpoint
(to show an immediate best-fit preview) and /matches/{resume_id} (to show
the full ranked list). Keeping this in one place means both call sites
compute scores identically.
"""
from collections import Counter
from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.models.job import Job
from app.models.resume import Resume
from app.ml.matcher import MatchResult, calculate_match

FIT_THRESHOLDS = (
    (75, "Strong Fit"),
    (55, "Good Fit"),
    (35, "Partial Fit"),
    (0, "Low Fit"),
)


def fit_label_for_score(score: float) -> str:
    for threshold, label in FIT_THRESHOLDS:
        if score >= threshold:
            return label
    return "Low Fit"


def gap_summary_for(result: MatchResult) -> str:
    """One sentence explaining how close a resume is to a specific job."""
    total_required = len(result.matched_skills) + len(result.missing_skills)
    if total_required == 0:
        return "This role isn't tagged with specific required skills - score is based on overall resume/description similarity."

    if not result.missing_skills:
        return f"You match all {total_required} required skills for this role."

    preview = ", ".join(result.missing_skills[:3])
    if len(result.missing_skills) > 3:
        preview += f", and {len(result.missing_skills) - 3} more"

    return (
        f"You match {len(result.matched_skills)} of {total_required} required skills. "
        f"To strengthen this application, build up: {preview}."
    )


@dataclass
class JobMatch:
    job: Job
    result: MatchResult


def compute_matches_for_resume(db: Session, resume: Resume) -> list[JobMatch]:
    """Score a resume against every job posting, sorted best-first."""
    jobs = db.query(Job).all()
    matches = [
        JobMatch(
            job=job,
            result=calculate_match(
                resume_text=resume.parsed_text,
                job_description=job.description,
                job_skills=job.skills,
                resume_skills=resume.skills,
            ),
        )
        for job in jobs
    ]
    matches.sort(key=lambda m: m.result.overall_score, reverse=True)
    return matches


def best_match_for_resume(db: Session, resume: Resume) -> JobMatch | None:
    matches = compute_matches_for_resume(db, resume)
    return matches[0] if matches else None


def skill_gap_summary(matches: list[JobMatch], top_n: int = 8, sample_size: int = 10) -> list[dict]:
    """
    Which missing skills show up most often across the resume's best
    matches - i.e. what to learn next to unlock the most opportunities.
    Computed purely from the missing_skills already returned per job, so
    it reflects the same real data the match cards show.
    """
    counter: Counter[str] = Counter()
    for job_match in matches[:sample_size]:
        counter.update(job_match.result.missing_skills)

    return [
        {"skill": skill, "frequency": count}
        for skill, count in counter.most_common(top_n)
    ]
