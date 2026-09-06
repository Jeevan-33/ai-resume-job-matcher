from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Resume Job Matcher API"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str
    SECRET_KEY: str  # NEW
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # NEW (24 hours)
    # Comma-separated list of extra browser origins allowed to call the API.
    # Localhost ports are always allowed via a regex in main.py.
    BACKEND_CORS_ORIGINS: str = ""

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.BACKEND_CORS_ORIGINS.split(",") if o.strip()]

    class Config:
        env_file = ".env"

# We create a single instance of this class to use throughout the app
settings = Settings()
