import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MONGODB_URI: str = os.getenv("MONGODB_URI")
    JWT_SECRET: str = os.getenv("JWT_SECRET")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS")

settings = Settings()