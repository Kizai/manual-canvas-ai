from sqlalchemy import ForeignKey, JSON, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import IdTimestampMixin


class Page(IdTimestampMixin, Base):
    __tablename__ = "pages"
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    page_no: Mapped[int] = mapped_column(Integer, nullable=False)
    width: Mapped[int] = mapped_column(Integer, nullable=False)
    height: Mapped[int] = mapped_column(Integer, nullable=False)
    unit: Mapped[str] = mapped_column(String(20), default="pt", nullable=False)
    background_color: Mapped[str] = mapped_column(String(20), default="#ffffff", nullable=False)
    elements_json: Mapped[list[dict]] = mapped_column(JSON, default=list, nullable=False)

    project = relationship("Project", back_populates="pages")
    versions = relationship("PageVersion", back_populates="page", cascade="all, delete-orphan")


class PageVersion(IdTimestampMixin, Base):
    __tablename__ = "page_versions"
    __table_args__ = (UniqueConstraint("page_id", "language", name="uq_page_language"),)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    page_id: Mapped[str] = mapped_column(ForeignKey("pages.id", ondelete="CASCADE"), nullable=False, index=True)
    language: Mapped[str] = mapped_column(String(20), nullable=False)
    elements_json: Mapped[list[dict]] = mapped_column(JSON, default=list, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="draft", nullable=False)

    page = relationship("Page", back_populates="versions")
