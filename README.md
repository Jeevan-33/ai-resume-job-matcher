# JobMatcher.io — AI Resume & Job Matching Platform

A full-stack application that parses a candidate's resume, scores it against a catalog of
real job postings, and produces a concrete, resource-backed plan for closing whatever skill
gap is left. Built with **FastAPI**, **PostgreSQL**, and **React**.

<p align="left">
  <img alt="Python" src="https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white">
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white">
</p>

---

## Overview

Job boards are good at listing roles and bad at telling you which ones you can actually get.
JobMatcher.io closes that gap:

1. **Upload a resume (PDF)** — contact details, a professional summary, and skills are
   extracted automatically.
2. **Get scored, not guessed at** — every open role is ranked by a real fit score computed
   from skill overlap (65%) and semantic text similarity via TF-IDF + cosine similarity (35%),
   not keyword matching.
3. **Close the gap** — any missing skill comes with a time-boxed learning plan pointing to
   real, curated resources (official docs, established free courses), downloadable as a PDF.
4. **Compare against the market** — each posting's salary is shown next to a real national
   benchmark for the closest matching occupation (U.S. BLS Occupational Employment and Wage
   Statistics).

## Features

- 🔐 **JWT authentication** — register/login with hashed passwords (`passlib[bcrypt]`)
- 📄 **Resume parsing** — PDF text extraction with contact info, summary, and skill detection
- 🎯 **AI-powered job matching** — TF-IDF + cosine similarity scoring, ranked best-fit first
- 🗂️ **90+ seeded job postings** across engineering, data, design, sales, marketing, and finance
- 🧭 **Career-branch filtering** (AI/ML, Data Science, Cybersecurity, Cloud/DevOps, and more)
- 📈 **Skill-gap learning plans** — per-job or per-match, with estimated timelines and exportable PDFs
- 💰 **Real market salary benchmarks** sourced from public BLS data
- 📊 **Candidate dashboard & profile** — upload history, detected skills, and application tracking
- 🎨 **Polished, responsive UI** with a marketing landing page, animated transitions, and a light professional theme

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Backend    | FastAPI, SQLAlchemy 2.0, Alembic, Pydantic, scikit-learn, PyPDF2 |
| Database   | PostgreSQL 15 |
| Auth       | JWT (PyJWT) + bcrypt password hashing |
| Frontend   | React 19, React Router 7, Vite, Tailwind CSS |
| Tooling    | Docker Compose, ESLint |

## Project Structure

```
ai-resume-job-matcher/
├── backend/
│   ├── app/
│   │   ├── api/endpoints/    # auth, users, resumes, jobs, matches, applications, plans
│   │   ├── core/             # settings & security (JWT, password hashing)
│   │   ├── db/                # SQLAlchemy session, seed_jobs script
│   │   ├── ml/                 # matcher, skills taxonomy, job taxonomy, salary benchmarks, learning paths
│   │   ├── models/           # SQLAlchemy models
│   │   └── schemas/          # Pydantic schemas
│   ├── alembic/versions/     # database migrations
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/            # Landing, Jobs, Login, Dashboard, Profile
│   │   ├── components/       # Modal, JobDetailModal, LearningPlan
│   │   └── ui.js             # shared button/card/input design tokens
│   └── Dockerfile
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose

### Run with Docker (recommended)

```bash
git clone https://github.com/jeevan-33/ai-resume-job-matcher.git
cd ai-resume-job-matcher
docker compose up -d --build
```

This starts three services:

| Service   | URL                          |
|-----------|-------------------------------|
| Frontend  | http://localhost:5173         |
| Backend API | http://localhost:8000 ([docs](http://localhost:8000/docs)) |
| PostgreSQL | localhost:5432                |

On first run, apply migrations and seed sample job postings:

```bash
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.db.seed_jobs
```

The frontend container bind-mounts `./frontend`, so edits to frontend source hot-reload
without a rebuild. Backend changes require a restart (`docker compose restart backend`);
dependency changes in either service require a rebuild (`docker compose up -d --build`).

### Run without Docker

**Backend**

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
cp .env.example .env         # then fill in DATABASE_URL and SECRET_KEY
alembic upgrade head
python -m app.db.seed_jobs
uvicorn app.main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in real values — this file is
git-ignored on purpose so secrets never get committed.

| Variable | Description |
|----------|--------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | Signing key for JWTs — use a long random value in production |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT session lifetime |
| `ENVIRONMENT` | `development` or `production` |

## API Reference

Interactive docs are auto-generated at `/docs` (Swagger UI) and `/redoc`. Key routes:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in, receive a JWT |
| GET | `/api/auth/me` | Current user |
| GET | `/api/users/me/profile` | Profile stats (resumes, applications, skills) |
| POST | `/api/resumes/upload` | Upload & parse a resume PDF |
| GET | `/api/resumes/me` | List your uploaded resumes |
| GET | `/api/jobs/` | List/search/filter job postings |
| GET | `/api/jobs/{job_id}` | Job detail + market salary benchmark |
| GET | `/api/jobs/categories` | Career-branch filter options |
| GET | `/api/matches/{resume_id}` | Ranked match scores for a resume |
| GET | `/api/plans/job/{job_id}` | Learning plan for a job's full skill set |
| GET | `/api/plans/gap/{resume_id}/{job_id}` | Learning plan for just the missing skills |
| POST | `/api/applications/` | Log an application |
| GET | `/api/applications/me` | List your applications |

## License

This project is available for personal and educational use.
