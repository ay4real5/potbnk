import sys
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5433/bankapp"

    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Rate limiting
    login_rate_window: int = 60    # seconds
    login_rate_max: int = 10       # attempts per window

    # App
    app_name: str = "Hunch Banking"
    debug: bool = False
    auto_create_tables: bool = True

    # Supabase
    supabase_url: str | None = None
    supabase_publishable_key: str | None = None
    supabase_service_role_key: str | None = None

    model_config = SettingsConfigDict(
        env_file="app/.env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.secret_key:
            sys.exit("FATAL: SECRET_KEY is not set. Refusing to start.")


@lru_cache
def get_settings() -> Settings:
    return Settings()
