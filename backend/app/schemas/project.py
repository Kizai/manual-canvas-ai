from pydantic import BaseModel, Field
from app.schemas.common import Timestamped


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    source_language: str = "zh-CN"
    target_languages: list[str] = Field(default_factory=lambda: ["en-US", "ja-JP"])
    default_page_size: str = "A4"


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    source_language: str | None = None
    target_languages: list[str] | None = None
    default_page_size: str | None = None


class ProjectRead(Timestamped):
    user_id: str
    name: str
    description: str | None
    source_language: str
    target_languages: list[str]
    default_page_size: str
