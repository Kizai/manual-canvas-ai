from collections.abc import Callable
from sqlalchemy.orm import Session
from app.models.task import Task


def create_task(db: Session, project_id: str | None, task_type: str, input_json: dict | None = None) -> Task:
    task = Task(project_id=project_id, task_type=task_type, status="pending", progress=0, input_json=input_json or {})
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def run_task(db: Session, task: Task, fn: Callable[[], dict]) -> Task:
    try:
        task.status = "running"
        task.progress = 10
        db.commit()
        output = fn()
        task.output_json = output
        task.status = "success"
        task.progress = 100
    except Exception as exc:  # pragma: no cover - defensive task boundary
        task.status = "failed"
        task.error_message = str(exc)
        task.progress = 100
    db.commit()
    db.refresh(task)
    return task
