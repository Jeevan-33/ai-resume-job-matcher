"""
Turns a list of skills into an ordered, actionable learning plan: what each
skill is for, where to actually start, and how long it realistically takes.

Resources are real, well-known, freely accessible destinations (official
docs, or a well-established free learning platform) - never invented course
names or fabricated URLs. Skills without a curated entry fall back to their
official documentation search and freeCodeCamp, which is honest about being
a generic starting point rather than pretending to be tailored content we
don't actually have.
"""
from dataclasses import dataclass, field
from urllib.parse import quote_plus

# ---------------------------------------------------------------------------
# Curated guides for the skills most likely to show up as a gap.
# ---------------------------------------------------------------------------

_LANGUAGE_TIER = 4   # a core programming language, from scratch
_FRAMEWORK_TIER = 3  # a framework/library built on a language you likely know
_TOOL_TIER = 2       # a tool, platform, or narrower library
_CONCEPT_TIER = 3    # a broad discipline (ML, system design, statistics)
_PRACTICE_TIER = 1   # a soft skill / practice-based competency

SKILL_GUIDES: dict[str, dict] = {
    # --- Languages ---
    "Python": {"summary": "General-purpose language behind most backend, data, and ML roles in this catalog.",
        "resources": [("Official Python Tutorial", "https://docs.python.org/3/tutorial/", "Documentation"),
                       ("Python for Everybody (Coursera, free to audit)", "https://www.coursera.org/specializations/python", "Course")],
        "weeks": _LANGUAGE_TIER},
    "JavaScript": {"summary": "The language of the web browser, and of Node.js on the backend.",
        "resources": [("MDN JavaScript Guide", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "Documentation"),
                       ("freeCodeCamp JavaScript Curriculum", "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", "Course")],
        "weeks": _LANGUAGE_TIER},
    "TypeScript": {"summary": "JavaScript with static types - expected in most modern frontend and Node.js roles.",
        "resources": [("TypeScript Handbook", "https://www.typescriptlang.org/docs/handbook/intro.html", "Documentation")],
        "weeks": _FRAMEWORK_TIER},
    "Java": {"summary": "Dominant language for enterprise backend systems (Spring Boot, Android).",
        "resources": [("Oracle's Java Tutorials", "https://docs.oracle.com/javase/tutorial/", "Documentation")],
        "weeks": _LANGUAGE_TIER},
    "C++": {"summary": "Systems-level language for performance-critical and embedded work.",
        "resources": [("learncpp.com", "https://www.learncpp.com/", "Documentation")],
        "weeks": _LANGUAGE_TIER},
    "C#": {"summary": "Primary language for the .NET ecosystem.",
        "resources": [("Microsoft Learn: C#", "https://learn.microsoft.com/en-us/dotnet/csharp/", "Documentation")],
        "weeks": _LANGUAGE_TIER},
    "Go": {"summary": "Compiled, concurrent language popular for high-throughput backend services.",
        "resources": [("A Tour of Go", "https://go.dev/tour/welcome/1", "Documentation")],
        "weeks": _LANGUAGE_TIER},
    "Rust": {"summary": "Memory-safe systems language used for performance-critical services.",
        "resources": [("The Rust Book", "https://doc.rust-lang.org/book/", "Documentation")],
        "weeks": _LANGUAGE_TIER},
    "Ruby": {"summary": "Dynamic language best known via the Rails web framework.",
        "resources": [("Ruby Quickstart", "https://www.ruby-lang.org/en/documentation/quickstart/", "Documentation")],
        "weeks": _LANGUAGE_TIER},
    "PHP": {"summary": "Server-side language still powering a large share of the web.",
        "resources": [("PHP Manual Tutorial", "https://www.php.net/manual/en/tutorial.php", "Documentation")],
        "weeks": _LANGUAGE_TIER},
    "Swift": {"summary": "Apple's language for native iOS/macOS development.",
        "resources": [("The Swift Programming Language book", "https://docs.swift.org/swift-book/", "Documentation")],
        "weeks": _LANGUAGE_TIER},
    "Kotlin": {"summary": "Modern, concise language for native Android development.",
        "resources": [("Kotlin Getting Started", "https://kotlinlang.org/docs/getting-started.html", "Documentation")],
        "weeks": _LANGUAGE_TIER},
    "SQL": {"summary": "The query language behind almost every data-related role in this catalog.",
        "resources": [("SQLBolt interactive lessons", "https://sqlbolt.com/", "Practice"),
                       ("PostgreSQL Tutorial", "https://www.postgresqltutorial.com/", "Documentation")],
        "weeks": _FRAMEWORK_TIER},

    # --- Frontend ---
    "React": {"summary": "The most in-demand frontend UI library in this job catalog.",
        "resources": [("react.dev - Learn React", "https://react.dev/learn", "Documentation")],
        "weeks": _FRAMEWORK_TIER},
    "Vue.js": {"summary": "Approachable frontend framework, common in mid-size product teams.",
        "resources": [("Vue.js Guide", "https://vuejs.org/guide/introduction.html", "Documentation")],
        "weeks": _FRAMEWORK_TIER},
    "Angular": {"summary": "Full-featured frontend framework common in enterprise applications.",
        "resources": [("Angular Tutorials", "https://angular.dev/tutorials", "Documentation")],
        "weeks": _FRAMEWORK_TIER},
    "Next.js": {"summary": "React framework adding routing, SSR, and production tooling.",
        "resources": [("Next.js Learn course", "https://nextjs.org/learn", "Course")],
        "weeks": _TOOL_TIER},
    "HTML": {"summary": "Markup fundamentals underlying every web UI.",
        "resources": [("MDN HTML docs", "https://developer.mozilla.org/en-US/docs/Web/HTML", "Documentation")],
        "weeks": _TOOL_TIER},
    "CSS": {"summary": "Styling fundamentals for layout, responsiveness, and visual design.",
        "resources": [("MDN CSS docs", "https://developer.mozilla.org/en-US/docs/Web/CSS", "Documentation")],
        "weeks": _TOOL_TIER},
    "Tailwind CSS": {"summary": "Utility-first CSS framework used across most modern frontend stacks.",
        "resources": [("Tailwind CSS docs", "https://tailwindcss.com/docs/installation", "Documentation")],
        "weeks": _TOOL_TIER},
    "Redux": {"summary": "Predictable state container commonly paired with React.",
        "resources": [("Redux Essentials tutorial", "https://redux.js.org/tutorials/essentials/part-1-overview-concepts", "Documentation")],
        "weeks": _TOOL_TIER},

    # --- Backend ---
    "Node.js": {"summary": "JavaScript runtime for backend services - pairs naturally with a React frontend.",
        "resources": [("Node.js official guides", "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs", "Documentation")],
        "weeks": _FRAMEWORK_TIER},
    "Express.js": {"summary": "Minimal Node.js web framework used to build REST APIs.",
        "resources": [("Express.js Getting Started", "https://expressjs.com/en/starter/installing.html", "Documentation")],
        "weeks": _TOOL_TIER},
    "FastAPI": {"summary": "Modern, high-performance Python web framework for building APIs.",
        "resources": [("FastAPI Tutorial", "https://fastapi.tiangolo.com/tutorial/", "Documentation")],
        "weeks": _FRAMEWORK_TIER},
    "Django": {"summary": "Full-featured Python web framework with a built-in ORM and admin.",
        "resources": [("Django Official Tutorial", "https://docs.djangoproject.com/en/stable/intro/tutorial01/", "Documentation")],
        "weeks": _FRAMEWORK_TIER},
    "Flask": {"summary": "Lightweight Python web framework, common for small APIs and services.",
        "resources": [("Flask Quickstart", "https://flask.palletsprojects.com/en/latest/quickstart/", "Documentation")],
        "weeks": _TOOL_TIER},
    "Spring Boot": {"summary": "Dominant Java framework for enterprise backend services.",
        "resources": [("Spring Boot Getting Started guide", "https://spring.io/guides/gs/spring-boot/", "Documentation")],
        "weeks": _FRAMEWORK_TIER},
    ".NET": {"summary": "Microsoft's backend framework for C#-based services.",
        "resources": [(".NET Getting Started", "https://learn.microsoft.com/en-us/dotnet/core/get-started", "Documentation")],
        "weeks": _FRAMEWORK_TIER},
    "GraphQL": {"summary": "Query language for APIs, an alternative to plain REST.",
        "resources": [("GraphQL.org - Learn", "https://graphql.org/learn/", "Documentation")],
        "weeks": _TOOL_TIER},
    "REST APIs": {"summary": "The standard architecture style nearly every job in this catalog assumes you know.",
        "resources": [("RESTful API Design", "https://restfulapi.net/", "Documentation")],
        "weeks": _TOOL_TIER},
    "Microservices": {"summary": "Architectural pattern for splitting a system into independently deployable services.",
        "resources": [("microservices.io patterns", "https://microservices.io/patterns/index.html", "Documentation")],
        "weeks": _CONCEPT_TIER},

    # --- Cloud / DevOps ---
    "AWS": {"summary": "The most widely required cloud platform across this catalog's infra and backend roles.",
        "resources": [("AWS Skill Builder (official, free)", "https://skillbuilder.aws/", "Course")],
        "weeks": _FRAMEWORK_TIER},
    "Azure": {"summary": "Microsoft's cloud platform, common in enterprise environments.",
        "resources": [("Microsoft Learn: Azure Fundamentals", "https://learn.microsoft.com/en-us/training/azure/", "Course")],
        "weeks": _FRAMEWORK_TIER},
    "GCP": {"summary": "Google's cloud platform, strong in data and ML infrastructure.",
        "resources": [("Google Cloud - Get Started", "https://cloud.google.com/docs/get-started", "Documentation")],
        "weeks": _FRAMEWORK_TIER},
    "Docker": {"summary": "Containerization - required to work with almost any modern deployment pipeline.",
        "resources": [("Docker Get Started guide", "https://docs.docker.com/get-started/", "Documentation")],
        "weeks": _TOOL_TIER},
    "Kubernetes": {"summary": "Container orchestration for running services at scale.",
        "resources": [("Kubernetes official tutorials", "https://kubernetes.io/docs/tutorials/", "Documentation")],
        "weeks": _FRAMEWORK_TIER},
    "Terraform": {"summary": "Infrastructure-as-code tool for reproducible cloud environments.",
        "resources": [("HashiCorp Terraform tutorials", "https://developer.hashicorp.com/terraform/tutorials", "Documentation")],
        "weeks": _TOOL_TIER},
    "CI/CD": {"summary": "Automated build/test/deploy pipelines expected on almost every engineering team.",
        "resources": [("GitHub Actions Quickstart", "https://docs.github.com/en/actions/quickstart", "Documentation")],
        "weeks": _TOOL_TIER},
    "Jenkins": {"summary": "Widely used open-source automation server for CI/CD pipelines.",
        "resources": [("Jenkins tutorials", "https://www.jenkins.io/doc/tutorials/", "Documentation")],
        "weeks": _TOOL_TIER},
    "GitHub Actions": {"summary": "GitHub's native CI/CD automation.",
        "resources": [("GitHub Actions docs", "https://docs.github.com/en/actions", "Documentation")],
        "weeks": _TOOL_TIER},
    "Linux": {"summary": "The operating system nearly all servers and cloud infrastructure run on.",
        "resources": [("Linux Journey", "https://linuxjourney.com/", "Course")],
        "weeks": _TOOL_TIER},
    "Ansible": {"summary": "Configuration management and automation tool.",
        "resources": [("Ansible Getting Started", "https://docs.ansible.com/ansible/latest/getting_started/index.html", "Documentation")],
        "weeks": _TOOL_TIER},
    "Prometheus": {"summary": "Metrics collection and alerting for production systems.",
        "resources": [("Prometheus - First Steps", "https://prometheus.io/docs/introduction/first_steps/", "Documentation")],
        "weeks": _TOOL_TIER},
    "Grafana": {"summary": "Dashboarding and visualization layer, usually paired with Prometheus.",
        "resources": [("Grafana Getting Started", "https://grafana.com/docs/grafana/latest/getting-started/", "Documentation")],
        "weeks": _TOOL_TIER},

    # --- Data / ML ---
    "Machine Learning": {"summary": "Core discipline behind every AI/ML role in this catalog.",
        "resources": [("Google's Machine Learning Crash Course (free)", "https://developers.google.com/machine-learning/crash-course", "Course")],
        "weeks": _CONCEPT_TIER + 2},
    "Deep Learning": {"summary": "Neural-network-based ML, the basis of most modern AI systems.",
        "resources": [("DeepLearning.AI courses", "https://www.deeplearning.ai/", "Course")],
        "weeks": _CONCEPT_TIER + 2},
    "Natural Language Processing": {"summary": "ML applied to text and language - core to NLP engineer roles.",
        "resources": [("Hugging Face NLP Course (free)", "https://huggingface.co/learn/nlp-course", "Course")],
        "weeks": _CONCEPT_TIER + 1},
    "Computer Vision": {"summary": "ML applied to images/video - core to computer vision roles.",
        "resources": [("OpenCV-Python Tutorials", "https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html", "Documentation")],
        "weeks": _CONCEPT_TIER + 1},
    "TensorFlow": {"summary": "Google's deep learning framework.",
        "resources": [("TensorFlow Tutorials", "https://www.tensorflow.org/tutorials", "Documentation")],
        "weeks": _FRAMEWORK_TIER},
    "PyTorch": {"summary": "Meta's deep learning framework, the most common choice in ML research and industry.",
        "resources": [("PyTorch Tutorials", "https://docs.pytorch.org/tutorials/", "Documentation")],
        "weeks": _FRAMEWORK_TIER},
    "scikit-learn": {"summary": "The standard Python library for classical machine learning.",
        "resources": [("scikit-learn tutorials", "https://scikit-learn.org/stable/tutorial/index.html", "Documentation")],
        "weeks": _TOOL_TIER},
    "Pandas": {"summary": "The standard Python library for tabular data manipulation.",
        "resources": [("Pandas: Getting Started", "https://pandas.pydata.org/docs/getting_started/index.html", "Documentation")],
        "weeks": _TOOL_TIER},
    "NumPy": {"summary": "Foundational numerical computing library for Python.",
        "resources": [("NumPy Quickstart", "https://numpy.org/doc/stable/user/quickstart.html", "Documentation")],
        "weeks": _TOOL_TIER},
    "Data Analysis": {"summary": "Turning raw data into decisions - the core skill behind analyst roles.",
        "resources": [("Kaggle Learn - Pandas & Data Cleaning", "https://www.kaggle.com/learn", "Course")],
        "weeks": _CONCEPT_TIER},
    "Data Visualization": {"summary": "Communicating data findings clearly through charts and dashboards.",
        "resources": [("Kaggle Learn - Data Visualization", "https://www.kaggle.com/learn/data-visualization", "Course")],
        "weeks": _TOOL_TIER},
    "Tableau": {"summary": "Leading BI/dashboarding tool for business reporting.",
        "resources": [("Tableau free training videos", "https://www.tableau.com/learn/training", "Course")],
        "weeks": _TOOL_TIER},
    "Power BI": {"summary": "Microsoft's BI/dashboarding tool, common in enterprise reporting.",
        "resources": [("Power BI documentation", "https://learn.microsoft.com/en-us/power-bi/fundamentals/", "Documentation")],
        "weeks": _TOOL_TIER},
    "ETL": {"summary": "Extract-Transform-Load pipelines that move and clean data at scale.",
        "resources": [("Apache Airflow Tutorial", "https://airflow.apache.org/docs/apache-airflow/stable/tutorial/fundamentals.html", "Documentation")],
        "weeks": _CONCEPT_TIER},
    "Apache Spark": {"summary": "Distributed data processing engine for large-scale pipelines.",
        "resources": [("Spark Quick Start", "https://spark.apache.org/docs/latest/quick-start.html", "Documentation")],
        "weeks": _FRAMEWORK_TIER},
    "Apache Airflow": {"summary": "Workflow orchestration for scheduled data pipelines.",
        "resources": [("Airflow Tutorial", "https://airflow.apache.org/docs/apache-airflow/stable/tutorial/", "Documentation")],
        "weeks": _TOOL_TIER},
    "Statistics": {"summary": "The mathematical foundation behind analysis, experimentation, and ML.",
        "resources": [("Khan Academy Statistics & Probability (free)", "https://www.khanacademy.org/math/statistics-probability", "Course")],
        "weeks": _CONCEPT_TIER},
    "A/B Testing": {"summary": "Designing controlled experiments to validate product/marketing changes.",
        "resources": [("Udacity: A/B Testing (free)", "https://www.udacity.com/course/ab-testing--ud257", "Course")],
        "weeks": _TOOL_TIER},

    # --- Databases ---
    "PostgreSQL": {"summary": "The most commonly required relational database in this catalog.",
        "resources": [("PostgreSQL Tutorial", "https://www.postgresqltutorial.com/", "Documentation")],
        "weeks": _TOOL_TIER},
    "MySQL": {"summary": "Widely used open-source relational database.",
        "resources": [("MySQL Tutorial", "https://dev.mysql.com/doc/mysql-tutorial-excerpt/", "Documentation")],
        "weeks": _TOOL_TIER},
    "MongoDB": {"summary": "Leading NoSQL document database.",
        "resources": [("MongoDB - Getting Started", "https://www.mongodb.com/docs/manual/tutorial/getting-started/", "Documentation")],
        "weeks": _TOOL_TIER},
    "Redis": {"summary": "In-memory data store used for caching and fast lookups.",
        "resources": [("Redis - Get Started", "https://redis.io/docs/latest/develop/get-started/", "Documentation")],
        "weeks": _TOOL_TIER},

    # --- Testing ---
    "Unit Testing": {"summary": "Writing automated tests for individual pieces of code - a baseline expectation everywhere.",
        "resources": [("Pytest Getting Started", "https://docs.pytest.org/en/stable/getting-started.html", "Documentation")],
        "weeks": _TOOL_TIER},
    "Selenium": {"summary": "Browser automation for end-to-end testing.",
        "resources": [("Selenium documentation", "https://www.selenium.dev/documentation/", "Documentation")],
        "weeks": _TOOL_TIER},
    "Jest": {"summary": "The standard JavaScript testing framework.",
        "resources": [("Jest Getting Started", "https://jestjs.io/docs/getting-started", "Documentation")],
        "weeks": _TOOL_TIER},
    "Pytest": {"summary": "The standard Python testing framework.",
        "resources": [("Pytest Getting Started", "https://docs.pytest.org/en/stable/getting-started.html", "Documentation")],
        "weeks": _TOOL_TIER},
    "Cypress": {"summary": "Modern end-to-end testing framework for web apps.",
        "resources": [("Cypress - Writing your first test", "https://docs.cypress.io/app/end-to-end-testing/writing-your-first-end-to-end-test", "Documentation")],
        "weeks": _TOOL_TIER},

    # --- Mobile ---
    "iOS Development": {"summary": "Native iOS app development, typically in Swift.",
        "resources": [("Apple - Develop for iOS", "https://developer.apple.com/tutorials/develop-in-swift", "Documentation")],
        "weeks": _CONCEPT_TIER},
    "Android Development": {"summary": "Native Android app development, typically in Kotlin.",
        "resources": [("Android Developers - Get Started", "https://developer.android.com/get-started/codelabs", "Documentation")],
        "weeks": _CONCEPT_TIER},
    "React Native": {"summary": "Cross-platform mobile development using React.",
        "resources": [("React Native - Get Started", "https://reactnative.dev/docs/getting-started", "Documentation")],
        "weeks": _FRAMEWORK_TIER},
    "Flutter": {"summary": "Google's cross-platform mobile UI toolkit.",
        "resources": [("Flutter - Get Started", "https://docs.flutter.dev/get-started/install", "Documentation")],
        "weeks": _FRAMEWORK_TIER},

    # --- Security ---
    "Cybersecurity": {"summary": "Foundational knowledge behind every security role in this catalog.",
        "resources": [("SANS Cyber Aces (free)", "https://www.sans.org/cyberaces/", "Course")],
        "weeks": _CONCEPT_TIER + 1},
    "Penetration Testing": {"summary": "Offensive security testing to find vulnerabilities before attackers do.",
        "resources": [("TryHackMe (free tier)", "https://tryhackme.com/", "Practice")],
        "weeks": _CONCEPT_TIER},
    "OAuth": {"summary": "The standard protocol for delegated authentication/authorization.",
        "resources": [("OAuth 2.0 Simplified", "https://www.oauth.com/", "Documentation")],
        "weeks": _TOOL_TIER},

    # --- Product / Design ---
    "Figma": {"summary": "The industry-standard collaborative design tool.",
        "resources": [("Figma - Getting Started", "https://help.figma.com/hc/en-us/categories/360002051613-Getting-started", "Documentation")],
        "weeks": _TOOL_TIER},
    "UI/UX Design": {"summary": "Designing usable, effective interfaces.",
        "resources": [("Google UX Design Certificate (Coursera, free to audit)", "https://www.coursera.org/professional-certificates/google-ux-design", "Course")],
        "weeks": _CONCEPT_TIER},
    "User Research": {"summary": "Structured methods for understanding user needs before/while building.",
        "resources": [("Nielsen Norman Group articles (free)", "https://www.nngroup.com/articles/", "Documentation")],
        "weeks": _TOOL_TIER},
    "System Design": {"summary": "Designing scalable, reliable software architecture - expected at senior levels.",
        "resources": [("System Design Primer (GitHub)", "https://github.com/donnemartin/system-design-primer", "Documentation")],
        "weeks": _CONCEPT_TIER + 1},

    # --- Business / sales / marketing / finance / HR ---
    "Salesforce": {"summary": "The dominant CRM platform behind most sales/success/RevOps roles.",
        "resources": [("Salesforce Trailhead (official, free)", "https://trailhead.salesforce.com/", "Course")],
        "weeks": _TOOL_TIER},
    "HubSpot": {"summary": "Popular marketing/sales CRM platform.",
        "resources": [("HubSpot Academy (free)", "https://academy.hubspot.com/", "Course")],
        "weeks": _TOOL_TIER},
    "SEO": {"summary": "Optimizing content to rank in search - core to most marketing roles.",
        "resources": [("Moz Beginner's Guide to SEO (free)", "https://moz.com/beginners-guide-to-seo", "Documentation")],
        "weeks": _TOOL_TIER},
    "Google Analytics": {"summary": "The standard tool for measuring web/marketing performance.",
        "resources": [("Google Analytics Academy (official, free)", "https://analytics.google.com/analytics/academy/", "Course")],
        "weeks": _TOOL_TIER},
    "Microsoft Excel": {"summary": "Still the most commonly required tool across finance, ops, and analyst roles.",
        "resources": [("Microsoft Excel Help & Learning", "https://support.microsoft.com/en-us/excel", "Documentation")],
        "weeks": _TOOL_TIER},
    "Financial Modeling": {"summary": "Building spreadsheet models to forecast and evaluate business decisions.",
        "resources": [("CFI free financial modeling resources", "https://corporatefinanceinstitute.com/resources/financial-modeling/", "Course")],
        "weeks": _CONCEPT_TIER},
    "Accounting": {"summary": "Core bookkeeping and financial reporting principles.",
        "resources": [("Khan Academy: Accounting and Financial Statements (free)", "https://www.khanacademy.org/economics-finance-domain/core-finance/accounting-and-financial-stateme", "Course")],
        "weeks": _CONCEPT_TIER},

    # --- Soft skills (practice, not study) ---
    "Communication": {"summary": "Clear written/verbal communication - evaluated in nearly every interview.",
        "resources": [("Harvard Business Review: Communication (free articles)", "https://hbr.org/topic/subject/business-communication", "Documentation")],
        "weeks": _PRACTICE_TIER},
    "Leadership": {"summary": "Guiding and influencing a team - built through practice, not a course alone.",
        "resources": [("HBR: Leadership (free articles)", "https://hbr.org/topic/subject/leadership", "Documentation")],
        "weeks": _PRACTICE_TIER},
    "Team Collaboration": {"summary": "Working effectively across functions - demonstrated through real project experience.",
        "resources": [("Atlassian Teamwork guides (free)", "https://www.atlassian.com/teamwork", "Documentation")],
        "weeks": _PRACTICE_TIER},
    "Problem Solving": {"summary": "Structured approaches to breaking down and solving unfamiliar problems.",
        "resources": [("NeetCode - practice DSA problems (free tier)", "https://neetcode.io/", "Practice")],
        "weeks": _PRACTICE_TIER},
    "Agile": {"summary": "The iterative delivery methodology used by most product/engineering teams.",
        "resources": [("Atlassian Agile Coach (free)", "https://www.atlassian.com/agile", "Documentation")],
        "weeks": _TOOL_TIER},
    "Git": {"summary": "Version control - a baseline requirement for essentially every technical role.",
        "resources": [("Learn Git Branching (interactive, free)", "https://learngitbranching.js.org/", "Practice")],
        "weeks": _TOOL_TIER},
}


@dataclass
class PlanStep:
    skill: str
    summary: str
    why_it_matters: str
    estimated_weeks: int
    resources: list[dict] = field(default_factory=list)


def _generic_guide(skill: str) -> dict:
    query = quote_plus(f"{skill} official documentation tutorial")
    return {
        "summary": f"No curated guide yet for {skill} - start with its official docs and a hands-on project.",
        "resources": [
            (f"Search: {skill} official docs/tutorial", f"https://www.google.com/search?q={query}", "Search"),
            ("freeCodeCamp (free, general programming curriculum)", "https://www.freecodecamp.org/", "Course"),
        ],
        "weeks": _TOOL_TIER,
    }


def skill_summary(skill: str) -> str:
    guide = SKILL_GUIDES.get(skill)
    return guide["summary"] if guide else f"A skill required by this role - not yet in our curated guide library."


def build_plan(skills: list[str], target_label: str) -> dict:
    """
    Build an ordered learning plan for `skills` (already in a sensible
    learn-first-to-last order, e.g. from MatchResult.missing_skills).
    `target_label` is the job title (or "the roles you're targeting") used
    to phrase why each skill matters.
    """
    steps: list[PlanStep] = []

    for skill in skills:
        guide = SKILL_GUIDES.get(skill) or _generic_guide(skill)
        resources = [
            {"name": name, "url": url, "type": rtype}
            for name, url, rtype in guide["resources"]
        ]
        steps.append(
            PlanStep(
                skill=skill,
                summary=guide["summary"],
                why_it_matters=f"Listed as a required skill for {target_label}.",
                estimated_weeks=guide["weeks"],
                resources=resources,
            )
        )

    total_weeks = sum(s.estimated_weeks for s in steps)

    return {
        "target_label": target_label,
        "total_estimated_weeks": total_weeks,
        "step_count": len(steps),
        "steps": [
            {
                "skill": s.skill,
                "summary": s.summary,
                "why_it_matters": s.why_it_matters,
                "estimated_weeks": s.estimated_weeks,
                "resources": s.resources,
            }
            for s in steps
        ],
    }
