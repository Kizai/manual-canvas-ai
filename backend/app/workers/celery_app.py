from celery import Celery
from app.core.config import get_settings

settings = get_settings()
celery_app = Celery("manual_canvas_ai", broker=settings.celery_broker_url, backend=settings.celery_result_backend)
celery_app.conf.task_routes = {
    "app.workers.tasks_terms.*": {"queue": "ai.term.extract"},
    "app.workers.tasks_translate.*": {"queue": "ai.translate"},
    "app.workers.tasks_quality.*": {"queue": "ai.quality_check"},
    "app.workers.tasks_export.*": {"queue": "document.export_pdf"},
}
