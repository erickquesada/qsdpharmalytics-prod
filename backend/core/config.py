from pydantic_settings import BaseSettings
from typing import List, Optional
import secrets
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "QSDPharmalitics"
    APP_VERSION: str = "2.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = secrets.token_urlsafe(32)
    
    # Database
    DATABASE_URL: str = "postgresql://pharmalitics_user:pharmalitics_pass@localhost:5432/pharmalitics"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "pharmalitics_user"
    POSTGRES_PASSWORD: str = "pharmalitics_pass"
    POSTGRES_DB: str = "pharmalitics"
    POSTGRES_PORT: int = 5432
    
    # Redis
    REDIS_URL: str = "redis://:redis_pass@localhost:6379"
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = "redis_pass"
    
    # API
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://localhost:3000",
        "http://localhost:8080"
    ]
    
    # Security
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 48
    
    # File Storage
    REPORTS_DIR: str = "./reports"
    UPLOADS_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10485760  # 10MB
    ALLOWED_FILE_TYPES: List[str] = ["csv", "xlsx", "xls", "pdf"]
    
    # Email (Optional)
    SMTP_TLS: bool = True
    SMTP_PORT: int = 587
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # Monitoring & Logging
    LOG_LEVEL: str = "INFO"
    SENTRY_DSN: Optional[str] = None
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # Analytics
    ENABLE_ADVANCED_ANALYTICS: bool = True
    ML_MODEL_UPDATE_INTERVAL: int = 24  # hours
    CACHE_TTL_SECONDS: int = 3600  # 1 hour
    
    # Timezone
    TIMEZONE: str = "UTC"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


# Global settings instance
settings = get_settings()