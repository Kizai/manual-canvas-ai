from sqlalchemy import ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import IdTimestampMixin


class Project(IdTimestampMixin, Base):
    __tablename__ = "projects"
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    source_language: Mapped[str] = mapped_column(String(20), default="zh-CN", nullable=False)
    target_languages: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    default_page_size: Mapped[str] = mapped_column(String(50), default="A4", nullable=False)

    user = relationship("User", back_populates="projects")
    pages = relationship("Page", back_populates="project", cascade="all, delete-orphan", order_by="Page.page_no")
    terms = relationship("Term", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
