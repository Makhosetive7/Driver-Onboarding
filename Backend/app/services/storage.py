import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import get_settings

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
}


async def save_upload(file: UploadFile, driver_id: str) -> tuple[str, str]:
    settings = get_settings()
    filename = file.filename or "upload.bin"
    ext = Path(filename).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Allowed: PDF, JPG, JPEG, PNG.",
        )

    content = await file.read()
    max_bytes = settings.max_upload_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {settings.max_upload_mb} MB.",
        )

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file is not allowed.",
        )

    stored_name = f"{driver_id}_{uuid.uuid4().hex}{ext}"
    dest = settings.upload_path / stored_name
    dest.write_bytes(content)

    return f"/api/documents/files/{stored_name}", filename


def resolve_stored_file(file_url: str) -> Path:
    settings = get_settings()
    name = Path(file_url).name
    path = settings.upload_path / name
    if not path.exists() or not path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="File not found."
        )
    return path


def delete_stored_file(file_url: str) -> None:
    try:
        path = resolve_stored_file(file_url)
        path.unlink(missing_ok=True)
    except HTTPException:
        pass
