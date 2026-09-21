from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy import (
    desc,
    select,
)

from sqlalchemy.orm import (
    Session,
    selectinload,
)

from app.db.session import get_db

from app.models.models import (
    Department,
    Doctor,
    Forecast,
    QueueEvent,
    Token,
)

from app.schemas.queue import (
    DoctorResponse,
    DoctorSummaryResponse,
    ForecastResponse,
    PatientResponse,
    QueueEventResponse,
    QueueResponse,
    QueueTokenResponse,
    TokenDetailResponse,
)


router = APIRouter(
    prefix="/api/v1",
    tags=["QueuePulse"],
)


# ==========================================================
# HELPERS
# ==========================================================


def latest_forecast_for_token(
    token: Token,
) -> Forecast | None:
    if not token.forecasts:
        return None

    return max(
        token.forecasts,
        key=lambda forecast: (
            forecast.model_version,
            forecast.generated_at,
        ),
    )


def serialize_forecast(
    forecast: Forecast | None,
) -> ForecastResponse | None:
    if forecast is None:
        return None

    return ForecastResponse(
        model_version=forecast.model_version,
        predicted_wait_minutes=forecast.predicted_wait_minutes,
        eta_min_minutes=forecast.eta_min_minutes,
        eta_max_minutes=forecast.eta_max_minutes,
        confidence_score=forecast.confidence_score,
        confidence_label=forecast.confidence_label,
        reason_code=forecast.reason_code,
        generated_at=forecast.generated_at,
    )


def serialize_patient(
    token: Token,
) -> PatientResponse:
    return PatientResponse(
        patient_code=token.visit.patient_code,
        display_name=token.visit.display_name,
        phone_masked=token.visit.phone_masked,
        channel=token.visit.channel,
        checked_in=token.visit.checked_in,
    )


def serialize_doctor_summary(
    token: Token,
) -> DoctorSummaryResponse | None:
    if token.doctor is None:
        return None

    return DoctorSummaryResponse(
        id=token.doctor.id,
        name=token.doctor.name,
        room_label=token.doctor.room_label,
        status=token.doctor.status,
    )


def serialize_queue_token(
    token: Token,
) -> QueueTokenResponse:
    forecast = latest_forecast_for_token(
        token
    )

    return QueueTokenResponse(
        id=token.id,
        token_number=token.token_number,
        status=token.status,
        priority_level=token.priority_level,
        is_priority=token.is_priority,
        queue_position=token.queue_position,
        department=token.department.name,
        department_code=token.department.code,
        patient=serialize_patient(token),
        doctor=serialize_doctor_summary(token),
        latest_forecast=serialize_forecast(
            forecast
        ),
    )


# ==========================================================
# GET LIVE QUEUE
# ==========================================================


@router.get(
    "/queue",
    response_model=QueueResponse,
)
def get_queue(
    department_code: str = Query(
        default="GM",
        description=(
            "Department code. "
            "GM = General Medicine."
        ),
    ),
    db: Session = Depends(get_db),
):
    department = db.scalar(
        select(Department).where(
            Department.code
            == department_code.upper()
        )
    )

    if department is None:
        raise HTTPException(
            status_code=404,
            detail="Department not found.",
        )

    statement = (
        select(Token)
        .where(
            Token.department_id
            == department.id
        )
        .options(
            selectinload(Token.visit),
            selectinload(Token.department),
            selectinload(Token.doctor),
            selectinload(Token.forecasts),
        )
        .order_by(
            Token.queue_position.is_(None),
            Token.queue_position,
            Token.sequence_number,
        )
    )

    tokens = list(
        db.scalars(
            statement
        ).all()
    )

    active_tokens = [
        token
        for token in tokens
        if token.status
        not in {
            "COMPLETED",
            "MISSED",
        }
    ]

    forecast_version = 1

    forecast_versions = [
        forecast.model_version
        for token in tokens
        for forecast in token.forecasts
    ]

    if forecast_versions:
        forecast_version = max(
            forecast_versions
        )

    return QueueResponse(
        department=department.name,
        department_code=department.code,
        active_count=len(
            active_tokens
        ),
        forecast_version=forecast_version,
        queue=[
            serialize_queue_token(
                token
            )
            for token in tokens
        ],
    )


# ==========================================================
# GET ONE TOKEN
# ==========================================================


@router.get(
    "/tokens/{token_number}",
    response_model=TokenDetailResponse,
)
def get_token(
    token_number: str,
    db: Session = Depends(get_db),
):
    normalized_token = (
        token_number
        .strip()
        .upper()
    )

    statement = (
        select(Token)
        .where(
            Token.token_number
            == normalized_token
        )
        .options(
            selectinload(Token.visit),
            selectinload(Token.department),
            selectinload(Token.doctor),
            selectinload(Token.forecasts),
        )
    )

    token = db.scalar(
        statement
    )

    if token is None:
        raise HTTPException(
            status_code=404,
            detail="Token not found.",
        )

    forecast = latest_forecast_for_token(
        token
    )

    return TokenDetailResponse(
        id=token.id,
        token_number=token.token_number,
        status=token.status,
        priority_level=token.priority_level,
        is_priority=token.is_priority,
        queue_position=token.queue_position,
        department=token.department.name,
        department_code=token.department.code,
        patient=serialize_patient(token),
        doctor=serialize_doctor_summary(token),
        latest_forecast=serialize_forecast(
            forecast
        ),
        created_at=token.created_at,
        checked_in_at=token.checked_in_at,
        called_at=token.called_at,
        serving_at=token.serving_at,
        completed_at=token.completed_at,
    )


# ==========================================================
# GET DOCTORS
# ==========================================================


@router.get(
    "/doctors",
    response_model=list[DoctorResponse],
)
def get_doctors(
    department_code: str | None = Query(
        default=None,
    ),
    db: Session = Depends(get_db),
):
    statement = (
        select(Doctor)
        .options(
            selectinload(
                Doctor.department
            )
        )
        .order_by(
            Doctor.name
        )
    )

    if department_code:
        statement = (
            statement
            .join(
                Department
            )
            .where(
                Department.code
                == department_code.upper()
            )
        )

    doctors = list(
        db.scalars(
            statement
        ).all()
    )

    return [
        DoctorResponse(
            id=doctor.id,
            name=doctor.name,
            department=doctor.department.name,
            department_code=doctor.department.code,
            room_label=doctor.room_label,
            status=doctor.status,
            average_consultation_minutes=(
                doctor.average_consultation_minutes
            ),
            is_active=doctor.is_active,
        )
        for doctor in doctors
    ]


# ==========================================================
# GET QUEUE EVENTS
# ==========================================================


@router.get(
    "/events",
    response_model=list[QueueEventResponse],
)
def get_events(
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
):
    statement = (
        select(QueueEvent)
        .options(
            selectinload(
                QueueEvent.token
            )
        )
        .order_by(
            desc(
                QueueEvent.created_at
            )
        )
        .limit(limit)
    )

    events = list(
        db.scalars(
            statement
        ).all()
    )

    return [
        QueueEventResponse(
            id=event.id,
            event_type=event.event_type,
            source=event.source,
            message=event.message,
            token_number=(
                event.token.token_number
                if event.token
                else None
            ),
            created_at=event.created_at,
            payload=event.payload,
        )
        for event in events
    ]