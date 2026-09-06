from fastapi import APIRouter
from app.api.endpoints import users, auth, resumes, jobs, matches, applications, plans

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["Resumes"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
api_router.include_router(matches.router, prefix="/matches", tags=["Matching"])
api_router.include_router(applications.router, prefix="/applications", tags=["Applications"])
api_router.include_router(plans.router, prefix="/plans", tags=["Learning Plans"])
