from fastapi import APIRouter, Depends

from app.api.deps import get_verified_driver
from app.models import Document, DocumentType, IdentityType, IdentityVerification, User
from app.schemas import IdentityResponse, IdentityUpdate
from app.services import get_or_create_profile

router = APIRouter(prefix="/api/driver", tags=["driver"])


@router.get("/identity", response_model=IdentityResponse)
async def get_identity(user: User = Depends(get_verified_driver)):
    profile = await get_or_create_profile(user.id)
    id_doc = await Document.find_one(
        Document.driver_id == profile.id,
        Document.document_type == DocumentType.IDENTITY_DOCUMENT,
    )
    if not profile.identity:
        return IdentityResponse(
            document_url=id_doc.file_url if id_doc else None,
            has_document=bool(id_doc),
        )
    identity = profile.identity
    return IdentityResponse(
        identity_type=identity.identity_type.value,
        identity_number=identity.identity_number,
        expiry_date=identity.expiry_date,
        document_url=identity.document_url or (id_doc.file_url if id_doc else None),
        has_document=bool(identity.document_url or id_doc),
    )


@router.put("/identity", response_model=IdentityResponse)
async def update_identity(
    payload: IdentityUpdate,
    user: User = Depends(get_verified_driver),
):
    profile = await get_or_create_profile(user.id)
    identity = profile.identity
    if not identity:
        identity = IdentityVerification(
            driver_id=profile.id,
            identity_type=IdentityType(payload.identity_type),
            identity_number=payload.identity_number.strip(),
            expiry_date=payload.expiry_date,
        )
        await identity.insert()
    else:
        identity.identity_type = IdentityType(payload.identity_type)
        identity.identity_number = payload.identity_number.strip()
        identity.expiry_date = payload.expiry_date
        await identity.save()

    id_doc = await Document.find_one(
        Document.driver_id == profile.id,
        Document.document_type == DocumentType.IDENTITY_DOCUMENT,
    )
    if id_doc:
        identity.document_url = id_doc.file_url
        await identity.save()

    profile.identity = identity
    return IdentityResponse(
        identity_type=identity.identity_type.value,
        identity_number=identity.identity_number,
        expiry_date=identity.expiry_date,
        document_url=identity.document_url,
        has_document=bool(identity.document_url),
    )
