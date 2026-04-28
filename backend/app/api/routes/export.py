from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.project import Project
from app.models.user import User
from app.schemas.task import ExportPdfRequest, TaskCreated
from app.services.export_service import export_pdf
from app.services.task_service import create_task, run_task

router = APIRouter(prefix="/projects/{project_id}/export", tags=["export"])


@router.post("/pdf", response_model=TaskCreated, status_code=202)
def export_project_pdf(project_id: str, payload: ExportPdfRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = db.get(Project, project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    task = create_task(db, project_id, "export_pdf", payload.model_dump())
    run_task(db, task, lambda: export_pdf(db, user.id, project_id, payload.language, payload.page_ids))
    return TaskCreated(task_id=task.id, status=task.status)
