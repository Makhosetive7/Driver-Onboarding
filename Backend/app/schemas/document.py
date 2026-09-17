from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    document_type: str
    file_name: str
    file_url: str
    status: str
    uploaded_at: datetime
