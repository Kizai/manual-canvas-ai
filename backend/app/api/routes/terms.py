from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.project import Project
from app.models.term import Term
from app.models.user import User
from app.schemas.task import TaskCreated
from app.schemas.term import TermCreate, TermRead, TermUpdate
from app.services.task_service import create_task, run_task
from app.services.term_service import extract_terms_for_project

router = APIRouter(prefix="/projects/{project_id}/terms", tags=["terms"])


def _owned_project(db: Session, user: User, project_id: str) -> Project:
    project = db.get(Project, project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.get("", response_model=list[TermRead])
def list_terms(project_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _owned_project(db, user, project_id)
    return db.query(Term).filter(Term.project_id == project_id).order_by(Term.source_term).all()


@router.post("", response_model=TermRead, status_code=201)
def create_term(project_id: str, payload: TermCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _owned_project(db, user, project_id)
    term = Term(project_id=project_id, **payload.model_dump())
    db.add(term)
    db.commit()
    db.refresh(term)
    return term


@router.patch("/{term_id}", response_model=TermRead)
def update_term(project_id: str, term_id: str, payload: TermUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _owned_project(db, user, project_id)
    term = db.get(Term, term_id)
    if not term or term.project_id != project_id:
        raise HTTPException(status_code=404, detail="Term not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(term, key, value)
    db.commit()
    db.refresh(term)
    return term


@router.delete("/{term_id}", status_code=204)
def delete_term(project_id: str, term_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _owned_project(db, user, project_id)
    term = db.get(Term, term_id)
    if not term or term.project_id != project_id:
        raise HTTPException(status_code=404, detail="Term not found")
    db.delete(term)
    db.commit()


@router.post("/extract", response_model=TaskCreated, status_code=202)
def extract_terms(project_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = _owned_project(db, user, project_id)
    task = create_task(db, project_id, "term_extract", {})
    run_task(db, task, lambda: extract_terms_for_project(db, project))
    return TaskCreated(task_id=task.id, status=task.status)
