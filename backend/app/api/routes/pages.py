from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.page import Page, PageVersion
from app.models.project import Project
from app.models.user import User
from app.schemas.page import ElementsUpdate, PageCreate, PageRead, PageVersionRead
from app.services.layout_service import resolve_page_size

router = APIRouter(tags=["pages"])


def _owned_project(db: Session, user: User, project_id: str) -> Project:
    project = db.get(Project, project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


def _owned_page(db: Session, user: User, page_id: str) -> Page:
    page = db.get(Page, page_id)
    if not page or page.project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@router.post("/projects/{project_id}/pages", response_model=PageRead, status_code=201)
def create_page(project_id: str, payload: PageCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _owned_project(db, user, project_id)
    width, height = resolve_page_size(payload.page_size, payload.width, payload.height)
    next_no = (db.query(func.max(Page.page_no)).filter(Page.project_id == project_id).scalar() or 0) + 1
    page = Page(project_id=project_id, page_no=next_no, width=width, height=height, unit=payload.unit, background_color=payload.background_color, elements_json=[])
    db.add(page)
    db.commit()
    db.refresh(page)
    return page


@router.get("/projects/{project_id}/pages", response_model=list[PageRead])
def list_pages(project_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _owned_project(db, user, project_id)
    return db.query(Page).filter(Page.project_id == project_id).order_by(Page.page_no).all()


@router.get("/pages/{page_id}", response_model=PageRead)
def get_page(page_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _owned_page(db, user, page_id)


@router.put("/pages/{page_id}/elements", response_model=PageRead)
def update_elements(page_id: str, payload: ElementsUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    page = _owned_page(db, user, page_id)
    page.elements_json = payload.elements
    db.commit()
    db.refresh(page)
    return page


@router.get("/pages/{page_id}/versions/{language}", response_model=PageVersionRead)
def get_page_version(page_id: str, language: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    page = _owned_page(db, user, page_id)
    version = db.query(PageVersion).filter(PageVersion.page_id == page.id, PageVersion.language == language).one_or_none()
    if not version:
        raise HTTPException(status_code=404, detail="Page version not found")
    return version
