"""
Classifies job postings into broad career domains so the UI can offer a
"branch" filter (AI/ML, Data Science, Cybersecurity, ...) instead of just
free-text search. Classification runs once at seed time and the result is
stored on the Job row - it's a simple keyword/skill-overlap heuristic, not
a live model, but that's the right amount of machinery for a fixed catalog.
"""

CATEGORIES = {
    "AIML": "AI / Machine Learning",
    "DS": "Data Science",
    "CS": "Software / CS",
    "IS": "Information Systems",
    "CY": "Cybersecurity",
    "CLOUD": "Cloud / DevOps",
    "PRODUCT": "Product & Design",
    "BUSINESS": "Business",
}

# Checked in order - the first matching bucket wins. BUSINESS keywords run
# early (before the DS/CS skill-overlap passes) so a "Sales Engineer" or a
# "Digital Marketing Manager" who happens to list Data Analysis or SQL
# doesn't get swept into Data Science just because of a shared tool skill.
_TITLE_KEYWORDS: list[tuple[str, list[str]]] = [
    ("AIML", ["machine learning", "ml engineer", "nlp", "computer vision", "ai engineer", "ai/ml", "ai labs"]),
    ("CY", ["security engineer", "security analyst", "penetration", "cybersecurity", "data privacy"]),
    ("BUSINESS", [
        "sales", "account executive", "marketing", "seo specialist", "demand generation",
        "e-commerce", "customer success", "financial analyst", "accountant", "payroll",
        "procurement", "supply chain", "compensation", "hr business partner",
        "people operations", "recruiter", "learning & development", "customer support",
        "scrum master", "technical project manager", "business operations",
    ]),
    ("DS", [
        "data scientist", "data analyst", "data engineer", "business intelligence",
        "bi analyst", "insurance data", "health data", "clinical data",
    ]),
    ("CLOUD", [
        "devops", "site reliability", "sre", "cloud engineer", "platform engineer",
        "infrastructure engineer", "network engineer", "systems administrator", "release manager",
    ]),
    ("PRODUCT", [
        "product designer", "ux researcher", "product manager", "instructional designer",
        "curriculum engineer", "localization manager",
    ]),
    ("IS", [
        "business analyst", "solutions architect", "salesforce administrator", "it support",
        "technical writer", "database administrator", "revenue operations", "legal operations",
        "implementation consultant", "technical account manager", "solutions engineer",
        "onboarding specialist",
    ]),
    ("CS", [
        "engineer", "developer", "architect", "programmer", "qa automation",
    ]),
]

_SKILL_HINTS: list[tuple[str, set[str]]] = [
    ("AIML", {"Machine Learning", "Deep Learning", "PyTorch", "TensorFlow",
              "Natural Language Processing", "Computer Vision"}),
    ("CY", {"Cybersecurity", "Penetration Testing", "OAuth"}),
    ("DS", {"Data Analysis", "Data Visualization", "ETL", "Apache Spark",
            "Apache Airflow", "Tableau", "Power BI", "Statistics", "A/B Testing"}),
    ("CLOUD", {"Kubernetes", "Terraform", "AWS", "Docker", "CI/CD", "Ansible",
               "Prometheus", "Grafana", "Linux"}),
]


def classify_category(title: str, skills: list[str] | None) -> str:
    title_lower = title.lower()
    skill_set = set(skills or [])

    for category, keywords in _TITLE_KEYWORDS:
        if any(kw in title_lower for kw in keywords):
            return category

    for category, hint_skills in _SKILL_HINTS:
        if skill_set & hint_skills:
            return category

    # Recognizable engineering/technical language anywhere in the title that
    # the keyword pass missed still belongs in the general software bucket.
    if any(word in title_lower for word in ["engineer", "developer"]):
        return "CS"

    return "BUSINESS"
