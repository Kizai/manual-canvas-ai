from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, export, files, pages, projects, quality, tasks, terms, translate
from app.core.config import get_settings
from app.core.database import init_db

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "app": settings.app_name}


for router in [auth.router, projects.router, pages.router, terms.router, translate.router, quality.router, export.router, tasks.router, files.router]:
    app.include_router(router, prefix=settings.api_prefix)
