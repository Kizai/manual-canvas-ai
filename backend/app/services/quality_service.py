from sqlalchemy.orm import Session
from app.models.page import Page, PageVersion
from app.models.term import Term
from app.services.ai_service import quality_check


def run_quality_check(db: Session, project_id: str, target_language: str, page_ids: list[str] | None) -> dict:
    query = db.query(Page).filter(Page.project_id == project_id).order_by(Page.page_no)
    if page_ids:
        query = query.filter(Page.id.in_(page_ids))
    terms = db.query(Term).filter(Term.project_id == project_id, Term.target_language == target_language).all()
    issues: list[dict] = []
    for page in query.all():
        version = db.query(PageVersion).filter(PageVersion.page_id == page.id, PageVersion.language == target_language).one_or_none()
        page_issues = quality_check(page.elements_json or [], (version.elements_json if version else []), terms, target_language)
        for issue in page_issues:
            issue["page"] = page.page_no
        issues.extend(page_issues)
    return {"project_id": project_id, "target_language": target_language, "issues": issues}
