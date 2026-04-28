from sqlalchemy.orm import Session
from app.models.page import Page, PageVersion
from app.models.term import Term
from app.services.ai_service import translate_elements


def translate_project_pages(db: Session, project_id: str, target_language: str, page_ids: list[str] | None, use_terms: bool, keep_layout: bool) -> dict:
    query = db.query(Page).filter(Page.project_id == project_id).order_by(Page.page_no)
    if page_ids:
        query = query.filter(Page.id.in_(page_ids))
    pages = query.all()
    terms = db.query(Term).filter(Term.project_id == project_id, Term.target_language == target_language).all() if use_terms else []
    all_results: list[dict] = []
    version_ids: list[str] = []
    for page in pages:
        translated_elements, results = translate_elements(page.elements_json or [], target_language, terms, keep_layout)
        version = db.query(PageVersion).filter(PageVersion.page_id == page.id, PageVersion.language == target_language).one_or_none()
        if not version:
            version = PageVersion(project_id=project_id, page_id=page.id, language=target_language)
            db.add(version)
        version.elements_json = translated_elements
        version.status = "translated"
        db.flush()
        version_ids.append(version.id)
        all_results.extend(results)
    db.commit()
    return {"target_language": target_language, "page_count": len(pages), "version_ids": version_ids, "items": all_results}
