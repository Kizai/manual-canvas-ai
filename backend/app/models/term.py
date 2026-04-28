from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import IdTimestampMixin


class Term(IdTimestampMixin, Base):
    __tablename__ = "terms"
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    source_term: Mapped[str] = mapped_column(String(255), nullable=False)
    target_language: Mapped[str] = mapped_column(String(20), nullable=False)
    target_term: Mapped[str] = mapped_column(String(255), nullable=False)
    term_type: Mapped[str | None] = mapped_column(String(50))
    description: Mapped[str | None] = mapped_column(Text)
    confirmed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    project = relationship("Project", back_populates="terms")
