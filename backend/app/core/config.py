from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str
    ENVIRONMENT: str
    DATABASE_URL: str
    SECRET_KEY: str  # NEW
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # NEW (24 hours)
    
    class Config:
        env_file = ".env"

# We create a single instance of this class to use throughout the app
settings = Settings()