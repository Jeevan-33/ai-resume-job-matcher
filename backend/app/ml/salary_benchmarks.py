"""
Real market salary benchmarks, sourced from the U.S. Bureau of Labor
Statistics Occupational Employment and Wage Statistics (OEWS) survey and
Occupational Outlook Handbook, May 2025 release - the same public dataset
salary sites like Glassdoor's "verified" figures are ultimately built on.

This is a *national average for the closest matching BLS occupation*, shown
alongside (not instead of) the specific salary_range a posting lists, so
the user can compare "what this one job offers" against "what the broader
market pays for this kind of work". It is not a live per-request scrape -
BLS publishes updated figures roughly once a year, so a periodically
refreshed static table is the accurate way to cite this data, not a network
call on every page view.

Source: https://www.bls.gov/oes/current/oes_nat.htm and
        https://www.bls.gov/ooh/ (Occupational Outlook Handbook), May 2025.
"""

SOURCE_NAME = "U.S. Bureau of Labor Statistics (OEWS/OOH)"
SOURCE_PERIOD = "May 2025"
SOURCE_URL = "https://www.bls.gov/oes/current/oes_nat.htm"

# Ordered most-specific-first: the first title keyword match wins.
BENCHMARKS: list[dict] = [
    {"keywords": ["machine learning", "ml engineer", "nlp", "computer vision", "ai engineer"],
     "occupation": "Computer and Information Research Scientists", "median_annual": 136_840},
    {"keywords": ["data scientist"],
     "occupation": "Data Scientists", "median_annual": 120_230},
    {"keywords": ["data engineer", "data analyst", "business intelligence", "bi analyst",
                  "insurance data", "health data", "clinical data"],
     "occupation": "Data Scientists", "median_annual": 120_230},
    {"keywords": ["security engineer", "security analyst", "penetration", "data privacy"],
     "occupation": "Information Security Analysts", "median_annual": 129_180},
    {"keywords": ["database administrator"],
     "occupation": "Database Administrators", "median_annual": 104_620},
    {"keywords": ["solutions architect", "database architect"],
     "occupation": "Database Architects", "median_annual": 139_500},
    {"keywords": ["network engineer", "systems administrator", "it support"],
     "occupation": "Network and Computer Systems Administrators", "median_annual": 99_130},
    {"keywords": ["devops", "site reliability", "sre", "cloud engineer", "platform engineer",
                  "infrastructure engineer", "release manager"],
     "occupation": "Software Developers", "median_annual": 135_980},
    {"keywords": ["web developer", "frontend engineer", "front-end", "react native"],
     "occupation": "Web Developers", "median_annual": 92_650},
    {"keywords": ["product designer", "ux researcher", "ui/ux"],
     "occupation": "Web and Digital Interface Designers", "median_annual": 104_000},
    {"keywords": ["financial analyst"],
     "occupation": "Financial and Investment Analysts", "median_annual": 102_740},
    {"keywords": ["accountant"],
     "occupation": "Accountants and Auditors", "median_annual": 83_680},
    {"keywords": ["human resources", "hr business partner", "recruiter", "people operations",
                  "compensation analyst", "learning & development"],
     "occupation": "Human Resources Specialists", "median_annual": 75_940},
    {"keywords": ["management analyst", "business analyst", "business operations",
                  "revenue operations", "process improvement", "legal operations"],
     "occupation": "Management Analysts", "median_annual": 101_860},
    {"keywords": ["market research", "marketing analyst", "marketing manager", "seo specialist",
                  "content marketing", "demand generation", "digital marketing",
                  "growth marketing", "product marketing", "e-commerce"],
     "occupation": "Market Research Analysts and Marketing Specialists", "median_annual": 78_760},
    {"keywords": ["sales engineer", "sales representative", "account executive",
                  "sales development"],
     "occupation": "Sales Representatives, Wholesale and Manufacturing (Technical Products)",
     "median_annual": 100_070},
    {"keywords": ["customer support", "customer service", "onboarding specialist"],
     "occupation": "Customer Service Representatives", "median_annual": 44_780},
    {"keywords": ["customer success", "technical account manager", "implementation consultant",
                  "solutions engineer"],
     "occupation": "Management Analysts", "median_annual": 101_860},
    {"keywords": ["supply chain", "procurement"],
     "occupation": "Logisticians", "median_annual": 79_400},
    {"keywords": ["payroll"],
     "occupation": "Bookkeeping, Accounting, and Auditing Clerks", "median_annual": 50_440},
    {"keywords": ["technical writer"],
     "occupation": "Technical Writers", "median_annual": 87_610},
    {"keywords": ["scrum master", "technical project manager", "product manager"],
     "occupation": "Management Analysts", "median_annual": 101_860},
    {"keywords": ["salesforce administrator"],
     "occupation": "Computer Systems Analysts", "median_annual": 103_800},
]

# Fallback by broad category when no title keyword matches.
CATEGORY_FALLBACK: dict[str, dict] = {
    "AIML": {"occupation": "Computer and Information Research Scientists", "median_annual": 136_840},
    "DS": {"occupation": "Data Scientists", "median_annual": 120_230},
    "CS": {"occupation": "Software Developers", "median_annual": 135_980},
    "IS": {"occupation": "Computer Systems Analysts", "median_annual": 103_800},
    "CY": {"occupation": "Information Security Analysts", "median_annual": 129_180},
    "CLOUD": {"occupation": "Software Developers", "median_annual": 135_980},
    "PRODUCT": {"occupation": "Web and Digital Interface Designers", "median_annual": 104_000},
    "BUSINESS": {"occupation": "Management Analysts", "median_annual": 101_860},
}


def benchmark_for_job(title: str, category: str | None) -> dict:
    title_lower = title.lower()

    match = None
    for entry in BENCHMARKS:
        if any(kw in title_lower for kw in entry["keywords"]):
            match = entry
            break

    if match is None:
        match = CATEGORY_FALLBACK.get(category or "", CATEGORY_FALLBACK["BUSINESS"])

    return {
        "occupation": match["occupation"],
        "median_annual": match["median_annual"],
        "source": SOURCE_NAME,
        "source_url": SOURCE_URL,
        "period": SOURCE_PERIOD,
    }
