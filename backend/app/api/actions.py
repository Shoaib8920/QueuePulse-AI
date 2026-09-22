from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import (
    require_roles,
)

from app.core.websocket_manager import (
    realtime_manager,
)

from app.db.session import (
    get_db,
)

from app.models.models import (
    AuditEvent,
    Doctor,
    Token,
    User,
)

from app.schemas.actions import (
    ActionResponse,
)

from app.services.queue_service import (
    QueueActionError,
    call_next_patient,
    complete_consultation,
    insert_priority_case,
    mark_no_show,
    pause_doctor,
    reset_demo,
    resume_doctor,
    start_consultation,
)


router = APIRouter(
    prefix="/api/v1",
    tags=["Queue Actions"],
)


def record_audit(
    db: Session,
    user: User,
    response: ActionResponse,
    audit_action: str,
    entity_type: str,
) -> None:
    entity_id = None

    if (
        response.token_number
    ):
        token = db.scalar(
            select(Token).where(
                Token.token_number
                == response.token_number
            )
        )

        if token:
            entity_id = (
                token.id
            )

    elif (
        entity_type
        == "DOCTOR"
    ):
        doctor = db.scalar(
            select(Doctor).where(
                Doctor.name
                == "Dr. Meera Shah"
            )
        )

        if doctor:
            entity_id = (
                doctor.id
            )

    audit = AuditEvent(
        actor_user_id=user.id,

        action=audit_action,

        entity_type=
            entity_type,

        entity_id=
            entity_id,

        details={
            "actor_name":
                user.name,

            "actor_email":
                user.email,

            "actor_role":
                user.role,

            "action_result":
                response.action,

            "message":
                response.message,

            "token_number":
                response.token_number,

            "doctor_status":
                response.doctor_status,

            "forecast_version":
                response.forecast_version,
        },
    )

    db.add(
        audit
    )

    db.commit()


async def execute_action(
    action_function,
    db: Session,
    current_user: User,
    audit_action: str,
    entity_type: str,
) -> ActionResponse:
    try:
        result = (
            action_function(
                db
            )
        )

        response = (
            ActionResponse(
                success=True,
                **result,
            )
        )

        record_audit(
            db=db,
            user=current_user,
            response=response,
            audit_action=
                audit_action,
            entity_type=
                entity_type,
        )

        await realtime_manager.broadcast(
            {
                "type":
                    "queue.updated",

                "action":
                    response.action,

                "message":
                    response.message,

                "token_number":
                    response.token_number,

                "doctor_status":
                    response.doctor_status,

                "forecast_version":
                    response.forecast_version,

                "performed_by":
                    current_user.name,

                "performed_by_role":
                    current_user.role,
            }
        )

        return response

    except QueueActionError as error:
        db.rollback()

        raise HTTPException(
            status_code=
                error.status_code,

            detail=
                error.message,
        )

    except Exception:
        db.rollback()
        raise


# ==========================================================
# PRIORITY INSERTION
# ==========================================================


@router.post(
    "/queue/priority",
    response_model=ActionResponse,
)
async def priority_insert(
    current_user: User = Depends(
        require_roles(
            "TRIAGE_STAFF",
            "OPERATIONS_MANAGER",
            "ADMIN",
        )
    ),

    db: Session = Depends(
        get_db
    ),
):
    return await execute_action(
        insert_priority_case,
        db,
        current_user,
        "PRIORITY_INSERTED",
        "TOKEN",
    )


# ==========================================================
# COMPLETE CONSULTATION
# ==========================================================


@router.post(
    "/doctor/complete",
    response_model=ActionResponse,
)
async def doctor_complete(
    current_user: User = Depends(
        require_roles(
            "DOCTOR",
            "OPERATIONS_MANAGER",
            "ADMIN",
        )
    ),

    db: Session = Depends(
        get_db
    ),
):
    return await execute_action(
        complete_consultation,
        db,
        current_user,
        "CONSULTATION_COMPLETED",
        "TOKEN",
    )


# ==========================================================
# CALL NEXT
# ==========================================================


@router.post(
    "/doctor/call-next",
    response_model=ActionResponse,
)
async def doctor_call_next(
    current_user: User = Depends(
        require_roles(
            "DOCTOR",
            "RECEPTIONIST",
            "OPERATIONS_MANAGER",
            "ADMIN",
        )
    ),

    db: Session = Depends(
        get_db
    ),
):
    return await execute_action(
        call_next_patient,
        db,
        current_user,
        "PATIENT_CALLED",
        "TOKEN",
    )


# ==========================================================
# START CONSULTATION
# ==========================================================


@router.post(
    "/doctor/start",
    response_model=ActionResponse,
)
async def doctor_start(
    current_user: User = Depends(
        require_roles(
            "DOCTOR",
            "OPERATIONS_MANAGER",
            "ADMIN",
        )
    ),

    db: Session = Depends(
        get_db
    ),
):
    return await execute_action(
        start_consultation,
        db,
        current_user,
        "CONSULTATION_STARTED",
        "TOKEN",
    )


# ==========================================================
# NO SHOW
# ==========================================================


@router.post(
    "/doctor/no-show",
    response_model=ActionResponse,
)
async def doctor_no_show(
    current_user: User = Depends(
        require_roles(
            "DOCTOR",
            "RECEPTIONIST",
            "OPERATIONS_MANAGER",
            "ADMIN",
        )
    ),

    db: Session = Depends(
        get_db
    ),
):
    return await execute_action(
        mark_no_show,
        db,
        current_user,
        "PATIENT_NO_SHOW",
        "TOKEN",
    )


# ==========================================================
# PAUSE DOCTOR
# ==========================================================


@router.post(
    "/doctor/pause",
    response_model=ActionResponse,
)
async def doctor_pause(
    current_user: User = Depends(
        require_roles(
            "DOCTOR",
            "OPERATIONS_MANAGER",
            "ADMIN",
        )
    ),

    db: Session = Depends(
        get_db
    ),
):
    return await execute_action(
        pause_doctor,
        db,
        current_user,
        "DOCTOR_PAUSED",
        "DOCTOR",
    )


# ==========================================================
# RESUME DOCTOR
# ==========================================================


@router.post(
    "/doctor/resume",
    response_model=ActionResponse,
)
async def doctor_resume(
    current_user: User = Depends(
        require_roles(
            "DOCTOR",
            "OPERATIONS_MANAGER",
            "ADMIN",
        )
    ),

    db: Session = Depends(
        get_db
    ),
):
    return await execute_action(
        resume_doctor,
        db,
        current_user,
        "DOCTOR_RESUMED",
        "DOCTOR",
    )


# ==========================================================
# RESET DEMO
# ==========================================================


@router.post(
    "/demo/reset",
    response_model=ActionResponse,
)
async def demo_reset(
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
    return await execute_action(
        reset_demo,
        db,
        current_user,
        "DEMO_RESET",
        "SYSTEM",
    )