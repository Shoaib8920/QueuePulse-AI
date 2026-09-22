from datetime import datetime

from pydantic import BaseModel


class AuditEventResponse(
    BaseModel
):
    id: str

    action: str

    entity_type: str

    entity_id: str | None

    actor_name: str | None

    actor_email: str | None

    actor_role: str | None

    details: dict | None

    created_at: datetime