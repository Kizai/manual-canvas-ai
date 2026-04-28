from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.project import Project
from app.models.user import User
from app.schemas.task import QualityCheckRequest, TaskCreated
from app.services.quality_service import run_quality_check
from app.services.task_service import create_task, run_task

router = APIRouter(prefix="/projects/{project_id}/quality-check", tags=["quality"])


@router.post("", response_model=TaskCreated, status_code=202)
def quality_check(project_id: str, payload: QualityCheckRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = db.get(Project, project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    task = create_task(db, project_id, "quality_check", payload.model_dump())
    run_task(db, task, lambda: run_quality_check(db, project_id, payload.target_language, payload.page_ids))
    return TaskCreated(task_id=task.id, status=task.status)
