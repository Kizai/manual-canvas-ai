from sqlalchemy.orm import Session
from app.models.page import Page
from app.models.project import Project
from app.models.term import Term
from app.services.ai_service import extract_candidate_terms


def extract_terms_for_project(db: Session, project: Project) -> dict:
    pages = db.query(Page).filter(Page.project_id == project.id).all()
    manual_text = "\n".join(str(el.get("text")) for page in pages for el in (page.elements_json or []) if el.get("type") == "text" and el.get("text"))
    candidates = extract_candidate_terms(manual_text)
    created: list[str] = []
    for candidate in candidates:
        for language in project.target_languages or ["en-US"]:
            target_term = candidate.get(language)
            if not target_term:
                continue
            exists = db.query(Term).filter(
                Term.project_id == project.id,
                Term.source_term == candidate["source_term"],
                Term.target_language == language,
            ).first()
            if exists:
                continue
            term = Term(
                project_id=project.id,
                source_term=candidate["source_term"],
                target_language=language,
                target_term=target_term,
                term_type=candidate.get("term_type"),
                confirmed=False,
            )
            db.add(term)
            db.flush()
            created.append(term.id)
    db.commit()
    return {"terms": candidates, "created_term_ids": created}
