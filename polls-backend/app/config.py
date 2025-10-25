from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    database_url: str = "sqlite:///./test.db"
    jwt_secret: str = "your-super-secret-jwt-key-change-this-in-production"
    jwt_expires_min: int = 15
    refresh_expires_days: int = 7
    allowed_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    class Config:
        env_file = None


settings = Settings()
