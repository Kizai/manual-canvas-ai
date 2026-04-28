from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Manual Canvas AI"
    api_prefix: str = "/api"
    database_url: str = "sqlite:///./manual_canvas.db"
    jwt_secret_key: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    storage_dir: str = "./storage"
    celery_broker_url: str = "memory://"
    celery_result_backend: str = "cache+memory://"
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000", "*"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def storage_path(self) -> Path:
        path = Path(self.storage_dir)
        path.mkdir(parents=True, exist_ok=True)
        (path / "exports").mkdir(parents=True, exist_ok=True)
        (path / "uploads").mkdir(parents=True, exist_ok=True)
        return path


@lru_cache
def get_settings() -> Settings:
    return Settings()
