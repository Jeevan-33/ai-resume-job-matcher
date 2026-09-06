from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import settings

app = FastAPI(title="AI Resume & Job Matching API", version="0.1.0")

# Add CORS middleware.
# Vite picks the next free port when 5173 is taken (5174, 5175, ...), which
# used to silently break every API call from the browser, so match any
# localhost port in development instead of hard-coding one.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to the AI Resume & Job Matching API!"}

@app.get("/api/health")
async def health():
    """Lets the frontend (and you) confirm the API is actually reachable."""
    return {"status": "ok", "environment": settings.ENVIRONMENT}
