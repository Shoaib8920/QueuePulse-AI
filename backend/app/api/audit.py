from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from sqlalchemy import (
    desc,
    select,
)

from sqlalchemy.orm import (
    Session,
)

from app.api.dependencies import (
    require_roles,
)

from app.db.session import (
    get_db,
)

from app.models.models import (
    AuditEvent,
    User,
)

from app.schemas.audit import (
    AuditEventResponse,
)


router = APIRouter(
    prefix="/api/v1",
    tags=["Audit"],
)


@router.get(
    "/audit",
    response_model=list[
        AuditEventResponse
    ],
)
def get_audit_log(
    limit: int = Query(
        default=50,
        ge=1,
        le=200,
    ),

    current_user: User = Depends(
        require_roles(
            "OPERATIONS_MANAGER",
            "ADMIN",
        )
    ),

    db: Session = Depends(
        get_db
    ),
):
    events = list(
        db.scalars(
            select(
                AuditEvent
            )
            .order_by(
                desc(
                    AuditEvent.created_at
                )
            )
            .limit(
                limit
            )
        ).all()
    )

    results = []

    for event in events:
        actor = None

        if (
            event.actor_user_id
        ):
            actor = db.get(
                User,
                event.actor_user_id,
            )

        results.append(
            AuditEventResponse(
                id=event.id,

                action=
                    event.action,

                entity_type=
                    event.entity_type,

                entity_id=
                    event.entity_id,

                actor_name=(
                    actor.name
                    if actor
                    else None
                ),

                actor_email=(
                    actor.email
                    if actor
                    else None
                ),

                actor_role=(
                    actor.role
                    if actor
                    else None
                ),

                details=
                    event.details,

                created_at=
                    event.created_at,
            )
        )

    return results