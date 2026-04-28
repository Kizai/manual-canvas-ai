from pydantic import BaseModel, Field
from app.schemas.common import Timestamped


class TermCreate(BaseModel):
    source_term: str = Field(min_length=1)
    target_language: str
    target_term: str = Field(min_length=1)
    term_type: str | None = None
    description: str | None = None
    confirmed: bool = False


class TermUpdate(BaseModel):
    source_term: str | None = None
    target_language: str | None = None
    target_term: str | None = None
    term_type: str | None = None
    description: str | None = None
    confirmed: bool | None = None


class TermRead(Timestamped):
    project_id: str
    source_term: str
    target_language: str
    target_term: str
    term_type: str | None
    description: str | None
    confirmed: bool
