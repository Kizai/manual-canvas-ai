from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.page import Page
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate
from app.services.layout_service import resolve_page_size

router = APIRouter(prefix="/projects", tags=["projects"])


def _get_project(db: Session, user: User, project_id: str) -> Project:
    project = db.get(Project, project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("", response_model=ProjectRead, status_code=201)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = Project(user_id=user.id, **payload.model_dump())
    db.add(project)
    db.flush()
    width, height = resolve_page_size(project.default_page_size)
    cover = Page(project_id=project.id, page_no=1, width=width, height=height, elements_json=[
        {"id": "title", "type": "text", "x": 60, "y": 80, "width": width - 120, "height": 48, "fontSize": 24, "fontWeight": "bold", "text": project.name},
        {"id": "subtitle", "type": "text", "x": 60, "y": 140, "width": width - 120, "height": 36, "fontSize": 14, "text": "产品使用说明书"},
    ])
    content = Page(project_id=project.id, page_no=2, width=width, height=height, elements_json=[])
    db.add_all([cover, content])
    db.commit()
    db.refresh(project)
    return project


@router.get("", response_model=list[ProjectRead])
def list_projects(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Project).filter(Project.user_id == user.id).order_by(Project.created_at.desc()).all()


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _get_project(db, user, project_id)


@router.patch("/{project_id}", response_model=ProjectRead)
def update_project(project_id: str, payload: ProjectUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = _get_project(db, user, project_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(project, key, value)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = _get_project(db, user, project_id)
    db.delete(project)
    db.commit()
