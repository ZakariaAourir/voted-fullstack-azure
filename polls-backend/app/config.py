from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union
import os


class Settings(BaseSettings):
    database_url: str = "sqlite:///./test.db"
    jwt_secret: str = "your-super-secret-jwt-key-change-this-in-production"
    jwt_expires_min: int = 15
    refresh_expires_days: int = 7
    allowed_origins: Union[List[str], str] = ["http://localhost:3000", "http://localhost:5173"]
    
    @field_validator('allowed_origins', mode='before')
    @classmethod
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            # Handle comma-separated string from environment variable
            if v.strip() == "":
                return ["http://localhost:3000", "http://localhost:5173"]
            return [origin.strip() for origin in v.split(',')]
        return v
    
    class Config:
        # Only load .env if it exists
        env_file = ".env" if os.path.exists(".env") else None
        case_sensitive = False


settings = Settings()
