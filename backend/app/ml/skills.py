"""
A curated skills taxonomy used to extract structured skills from free-form
resume and job-description text, so matching can be based on real overlap
instead of raw document similarity alone.

Each canonical skill maps to a list of surface forms (aliases) that should
be recognized in text. The canonical name is what gets stored/displayed.
"""
import re

SKILLS_TAXONOMY: dict[str, list[str]] = {
    # Languages
    "Python": ["python"],
    "JavaScript": ["javascript", "js"],
    "TypeScript": ["typescript", "ts"],
    "Java": ["\\bjava\\b"],
    "C++": ["c\\+\\+", "cpp"],
    "C#": ["c#", "csharp"],
    "Go": ["golang", "go lang", "\\bgo\\b"],
    "Rust": ["rust"],
    "Ruby": ["ruby"],
    "PHP": ["php"],
    "Swift": ["swift"],
    "Kotlin": ["kotlin"],
    "R": ["\\br\\b(?=.*(stat|data|analysis))", "r programming"],
    "SQL": ["sql"],
    "Scala": ["scala"],
    "C": ["\\bc\\b(?![\\+#])"],

    # Frontend
    "React": ["react\\.js", "react js", "reactjs", "\\breact\\b"],
    "Vue.js": ["vue\\.js", "vuejs", "\\bvue\\b"],
    "Angular": ["angular"],
    "Next.js": ["next\\.js", "nextjs"],
    "HTML": ["html5?"],
    "CSS": ["css3?"],
    "Tailwind CSS": ["tailwind"],
    "Redux": ["redux"],
    "Svelte": ["svelte"],

    # Backend / frameworks
    "Node.js": ["node\\.js", "nodejs", "\\bnode\\b"],
    "Express.js": ["express\\.js", "expressjs", "\\bexpress\\b"],
    "FastAPI": ["fastapi"],
    "Django": ["django"],
    "Flask": ["flask"],
    "Spring Boot": ["spring boot", "spring framework", "\\bspring\\b"],
    ".NET": ["\\.net", "dotnet"],
    "GraphQL": ["graphql"],
    "REST APIs": ["rest api", "restful", "\\brest\\b"],
    "Microservices": ["microservices?"],

    # Cloud / DevOps
    "AWS": ["amazon web services", "\\baws\\b"],
    "Azure": ["microsoft azure", "\\bazure\\b"],
    "GCP": ["google cloud platform", "google cloud", "\\bgcp\\b"],
    "Docker": ["docker"],
    "Kubernetes": ["kubernetes", "k8s"],
    "Terraform": ["terraform"],
    "CI/CD": ["ci/cd", "ci\\-cd", "continuous integration", "continuous deployment"],
    "Jenkins": ["jenkins"],
    "GitHub Actions": ["github actions"],
    "Linux": ["linux"],
    "Ansible": ["ansible"],
    "Prometheus": ["prometheus"],
    "Grafana": ["grafana"],
    "Nginx": ["nginx"],

    # Data / ML
    "Machine Learning": ["machine learning", "\\bml\\b"],
    "Deep Learning": ["deep learning"],
    "Natural Language Processing": ["natural language processing", "\\bnlp\\b"],
    "Computer Vision": ["computer vision"],
    "TensorFlow": ["tensorflow"],
    "PyTorch": ["pytorch"],
    "scikit-learn": ["scikit-learn", "sklearn"],
    "Pandas": ["pandas"],
    "NumPy": ["numpy"],
    "Data Analysis": ["data analysis"],
    "Data Visualization": ["data visualization"],
    "Tableau": ["tableau"],
    "Power BI": ["power bi", "powerbi"],
    "ETL": ["\\betl\\b", "extract transform load"],
    "Apache Spark": ["apache spark", "\\bspark\\b"],
    "Apache Airflow": ["apache airflow", "\\bairflow\\b"],
    "Statistics": ["statistics", "statistical analysis"],
    "A/B Testing": ["a/b testing", "ab testing"],

    # Databases
    "PostgreSQL": ["postgresql", "postgres"],
    "MySQL": ["mysql"],
    "MongoDB": ["mongodb", "mongo"],
    "Redis": ["redis"],
    "Elasticsearch": ["elasticsearch"],
    "DynamoDB": ["dynamodb"],
    "SQLite": ["sqlite"],

    # Testing / quality
    "Unit Testing": ["unit testing", "unit tests"],
    "Test Automation": ["test automation", "automated testing"],
    "Selenium": ["selenium"],
    "Jest": ["jest"],
    "Pytest": ["pytest"],
    "Cypress": ["cypress"],

    # Mobile
    "iOS Development": ["ios development", "\\bios\\b"],
    "Android Development": ["android development", "\\bandroid\\b"],
    "React Native": ["react native"],
    "Flutter": ["flutter"],

    # Product / design / security
    "Product Management": ["product management"],
    "Agile": ["agile", "scrum"],
    "Jira": ["jira"],
    "Figma": ["figma"],
    "UI/UX Design": ["ui/ux", "ux design", "ui design", "user experience"],
    "Wireframing": ["wireframing", "wireframes"],
    "User Research": ["user research"],
    "Cybersecurity": ["cybersecurity", "cyber security", "infosec"],
    "Penetration Testing": ["penetration testing", "pen testing"],
    "OAuth": ["oauth"],
    "Git": ["\\bgit\\b"],
    "System Design": ["system design"],

    # Sales / Marketing
    "Salesforce": ["salesforce"],
    "HubSpot": ["hubspot"],
    "SEO": ["search engine optimization", "\\bseo\\b"],
    "Content Marketing": ["content marketing"],
    "Copywriting": ["copywriting", "copywriter"],
    "Social Media Marketing": ["social media marketing", "social media management"],
    "Email Marketing": ["email marketing"],
    "Google Analytics": ["google analytics"],
    "CRM": ["\\bcrm\\b", "customer relationship management"],
    "Demand Generation": ["demand generation", "demand gen"],
    "Lead Generation": ["lead generation"],
    "Sales": ["\\bsales\\b", "quota", "prospecting"],
    "Account Management": ["account management"],
    "Negotiation": ["negotiation"],

    # Finance / Accounting / Ops
    "Financial Modeling": ["financial modeling", "financial modelling"],
    "Accounting": ["accounting"],
    "Bookkeeping": ["bookkeeping"],
    "Forecasting": ["forecasting"],
    "Budgeting": ["budgeting"],
    "Microsoft Excel": ["microsoft excel", "\\bexcel\\b"],
    "Financial Analysis": ["financial analysis"],
    "Supply Chain Management": ["supply chain management", "supply chain"],
    "Procurement": ["procurement"],
    "Vendor Management": ["vendor management"],
    "Process Improvement": ["process improvement"],
    "Business Analysis": ["business analysis"],

    # HR / People / Support
    "Recruiting": ["recruiting", "talent acquisition"],
    "Onboarding": ["onboarding"],
    "Payroll": ["payroll"],
    "Compensation & Benefits": ["compensation and benefits", "compensation & benefits"],
    "Customer Support": ["customer support", "customer service"],
    "Zendesk": ["zendesk"],
    "Technical Writing": ["technical writing", "technical documentation"],
    "Localization": ["localization", "localisation"],
    "Public Speaking": ["public speaking"],

    # Gaming / Embedded / Blockchain
    "Unity": ["\\bunity3d\\b", "\\bunity\\b"],
    "Unreal Engine": ["unreal engine", "\\bunreal\\b"],
    "Embedded Systems": ["embedded systems", "embedded software"],
    "Firmware Development": ["firmware"],
    "Blockchain": ["blockchain"],
    "Solidity": ["solidity"],

    # Soft skills
    "Communication": ["communication skills", "\\bcommunication\\b"],
    "Leadership": ["leadership"],
    "Team Collaboration": ["collaboration", "teamwork", "cross-functional"],
    "Problem Solving": ["problem solving", "problem-solving"],
    "Project Management": ["project management"],
    "Mentoring": ["mentoring", "mentorship"],
}

_COMPILED: list[tuple[str, "re.Pattern"]] = [
    (canonical, re.compile("|".join(fr"(?:{alias})" for alias in aliases), re.IGNORECASE))
    for canonical, aliases in SKILLS_TAXONOMY.items()
]

ALL_SKILLS: list[str] = list(SKILLS_TAXONOMY.keys())


def extract_skills(text: str | None) -> list[str]:
    """Return the canonical skills from the taxonomy found anywhere in `text`."""
    if not text:
        return []
    found = [canonical for canonical, pattern in _COMPILED if pattern.search(text)]
    return found
