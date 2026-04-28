from pydantic import BaseModel, Field
from app.schemas.common import Timestamped


class TaskRead(Timestamped):
    project_id: str | None
    task_type: str
    status: str
    progress: int
    input_json: dict | None = None
    output_json: dict | None = None
    error_message: str | None = None


class TaskCreated(BaseModel):
    task_id: str
    status: str


class TranslateRequest(BaseModel):
    target_language: str
    page_ids: list[str] | None = None
    use_terms: bool = True
    keep_layout: bool = True


class QualityCheckRequest(BaseModel):
    target_language: str
    page_ids: list[str] | None = None


class ExportPdfRequest(BaseModel):
    language: str = "source"
    page_ids: list[str] | None = None
