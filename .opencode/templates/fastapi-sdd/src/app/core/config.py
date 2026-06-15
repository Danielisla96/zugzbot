"""Application settings loaded from environment variables (or .env)."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "zugzbot-v2"
    env: str = "development"
    debug: bool = True
    api_prefix: str = ""


settings = Settings()
