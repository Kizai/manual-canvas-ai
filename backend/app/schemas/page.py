from typing import Any, Literal
from pydantic import BaseModel, Field
from app.schemas.common import Timestamped


class CanvasElement(BaseModel):
    id: str
    type: Literal["text", "image", "rect", "line", "table", "icon"]
    x: float = 0
    y: float = 0
    width: float = 100
    height: float = 100
    rotation: float = 0
    opacity: float = 1
    locked: bool = False
    visible: bool = True
    text: str | None = None
    src: str | None = None
    fontSize: float | None = 14
    fontFamily: str | None = "Arial"
    fontWeight: str | None = "normal"
    color: str | None = "#000000"
    lineHeight: float | None = 1.4
    align: str | None = "left"
    stroke: str | None = "#111827"
    fill: str | None = "transparent"
    points: list[float] | None = None
    metadata: dict[str, Any] | None = None


class PageCreate(BaseModel):
    page_size: str = "A4"
    width: int | None = None
    height: int | None = None
    unit: str = "pt"
    background_color: str = "#ffffff"


class PageRead(Timestamped):
    project_id: str
    page_no: int
    width: int
    height: int
    unit: str
    background_color: str
    elements_json: list[dict]


class PageOrderUpdate(BaseModel):
    page_ids: list[str] = Field(min_length=1)


class ElementsUpdate(BaseModel):
    elements: list[dict] = Field(default_factory=list)


class PageVersionRead(Timestamped):
    project_id: str
    page_id: str
    language: str
    elements_json: list[dict]
    status: str
