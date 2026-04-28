from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.file import File
from app.models.user import User

router = APIRouter(prefix="/files", tags=["files"])


@router.get("/{file_id}/download")
def download_file(file_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    file = db.get(File, file_id)
    if not file or (file.user_id and file.user_id != user.id):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file.file_path, media_type=file.file_type or "application/octet-stream", filename=file.file_name)
