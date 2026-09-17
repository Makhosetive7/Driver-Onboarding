from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from app.api.deps import get_current_user, get_verified_driver, parse_object_id
from app.models import Document, DocumentStatus, DocumentType, User, UserRole
from app.schemas import DocumentResponse
from app.services import (
    delete_stored_file,
    get_or_create_profile,
    resolve_stored_file,
    save_upload,
)

router = APIRouter(prefix="/api/documents", tags=["documents"])

VALID_DOC_TYPES = {t.value for t in DocumentType}


@router.get("", response_model=list[DocumentResponse])
async def list_documents(user: User = Depends(get_verified_driver)):
    profile = await get_or_create_profile(user.id)
    return [
        DocumentResponse(
            id=str(d.id),
            document_type=d.document_type.value,
            file_name=d.file_name,
            file_url=d.file_url,
            status=d.status.value,
            uploaded_at=d.uploaded_at,
        )
        for d in profile.documents
    ]


@router.post("", response_model=DocumentResponse, status_code=201)
async def upload_document(
    document_type: str = Form(...),
    file: UploadFile = File(...),
    user: User = Depends(get_verified_driver),
):
    if document_type not in VALID_DOC_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid document type.",
        )

    profile = await get_or_create_profile(user.id)
    file_url, file_name = await save_upload(file, str(profile.id))
    doc_enum = DocumentType(document_type)

    existing = await Document.find_one(
        Document.driver_id == profile.id,
        Document.document_type == doc_enum,
    )

    if existing:
        delete_stored_file(existing.file_url)
        existing.file_url = file_url
        existing.file_name = file_name
        existing.status = DocumentStatus.UPLOADED
        await existing.save()
        doc = existing
    else:
        doc = Document(
            driver_id=profile.id,
            document_type=doc_enum,
            file_url=file_url,
            file_name=file_name,
            status=DocumentStatus.UPLOADED,
        )
        await doc.insert()

    if doc_enum == DocumentType.IDENTITY_DOCUMENT and profile.identity:
        profile.identity.document_url = file_url
        await profile.identity.save()

    return DocumentResponse(
        id=str(doc.id),
        document_type=doc.document_type.value,
        file_name=doc.file_name,
        file_url=doc.file_url,
        status=doc.status.value,
        uploaded_at=doc.uploaded_at,
    )


@router.delete("/{document_id}", status_code=204)
async def delete_document(
    document_id: str,
    user: User = Depends(get_verified_driver),
):
    profile = await get_or_create_profile(user.id)
    oid = parse_object_id(document_id)
    doc = await Document.find_one(Document.id == oid, Document.driver_id == profile.id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if (
        doc.document_type == DocumentType.IDENTITY_DOCUMENT
        and profile.identity
        and profile.identity.document_url == doc.file_url
    ):
        profile.identity.document_url = None
        await profile.identity.save()

    delete_stored_file(doc.file_url)
    await doc.delete()


@router.get("/files/{filename}")
async def get_file(
    filename: str,
    user: User = Depends(get_current_user),
):
    """Serve uploaded files only to the owning driver or an admin."""
    file_url = f"/api/documents/files/{filename}"
    doc = await Document.find_one(Document.file_url == file_url)

    if not doc:
        from app.models import IdentityVerification

        identity = await IdentityVerification.find_one(
            IdentityVerification.document_url == file_url
        )
        if not identity:
            raise HTTPException(status_code=404, detail="File not found.")
        driver_id = identity.driver_id
    else:
        driver_id = doc.driver_id

    if user.role != UserRole.ADMIN:
        profile = await get_or_create_profile(user.id)
        if profile.id != driver_id:
            raise HTTPException(status_code=403, detail="Access denied.")

    path = resolve_stored_file(file_url)
    return FileResponse(path)
