from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.project import Project
from app.models.user import User
from app.schemas.task import TaskCreated, TranslateRequest
from app.services.task_service import create_task, run_task
from app.services.translation_service import translate_project_pages

router = APIRouter(prefix="/projects/{project_id}/translate", tags=["translate"])


@router.post("", response_model=TaskCreated, status_code=202)
def translate(project_id: str, payload: TranslateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = db.get(Project, project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    task = create_task(db, project_id, "translate", payload.model_dump())
    run_task(db, task, lambda: translate_project_pages(db, project_id, payload.target_language, payload.page_ids, payload.use_terms, payload.keep_layout))
    return TaskCreated(task_id=task.id, status=task.status)
