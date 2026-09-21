from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.core.websocket_manager import (
    realtime_manager,
)

from app.db.session import get_db

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


async def execute_action(
    action_function,
    db: Session,
) -> ActionResponse:
    try:
        result = action_function(
            db
        )

        response = ActionResponse(
            success=True,
            **result,
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
            }
        )

        return response

    except QueueActionError as error:
        db.rollback()

        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        )

    except Exception:
        db.rollback()
        raise


@router.post(
    "/queue/priority",
    response_model=ActionResponse,
)
async def priority_insert(
    db: Session = Depends(get_db),
):
    return await execute_action(
        insert_priority_case,
        db,
    )


@router.post(
    "/doctor/complete",
    response_model=ActionResponse,
)
async def doctor_complete(
    db: Session = Depends(get_db),
):
    return await execute_action(
        complete_consultation,
        db,
    )


@router.post(
    "/doctor/call-next",
    response_model=ActionResponse,
)
async def doctor_call_next(
    db: Session = Depends(get_db),
):
    return await execute_action(
        call_next_patient,
        db,
    )


@router.post(
    "/doctor/start",
    response_model=ActionResponse,
)
async def doctor_start(
    db: Session = Depends(get_db),
):
    return await execute_action(
        start_consultation,
        db,
    )


@router.post(
    "/doctor/no-show",
    response_model=ActionResponse,
)
async def doctor_no_show(
    db: Session = Depends(get_db),
):
    return await execute_action(
        mark_no_show,
        db,
    )


@router.post(
    "/doctor/pause",
    response_model=ActionResponse,
)
async def doctor_pause(
    db: Session = Depends(get_db),
):
    return await execute_action(
        pause_doctor,
        db,
    )


@router.post(
    "/doctor/resume",
    response_model=ActionResponse,
)
async def doctor_resume(
    db: Session = Depends(get_db),
):
    return await execute_action(
        resume_doctor,
        db,
    )


@router.post(
    "/demo/reset",
    response_model=ActionResponse,
)
async def demo_reset(
    db: Session = Depends(get_db),
):
    return await execute_action(
        reset_demo,
        db,
    )