from app.workers.celery_app import celery_app


@celery_app.task(name=__name__ + ".placeholder")
def placeholder(task_id: str) -> str:
    """Celery entry point placeholder; API currently executes MVP tasks synchronously for deterministic tests."""
    return task_id
