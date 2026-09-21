from datetime import datetime, timezone

from sqlalchemy import (
    delete,
    select,
)
from sqlalchemy.orm import Session

from app.models.models import (
    ConsultationHistory,
    Department,
    Doctor,
    Forecast,
    Notification,
    PatientVisit,
    QueueEvent,
    Token,
)

from app.services.forecast_engine import (
    recalculate_queue_forecasts,
)


class QueueActionError(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = 400,
    ):
        super().__init__(message)

        self.message = message
        self.status_code = status_code


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ==========================================================
# CORE HELPERS
# ==========================================================


def get_department(
    db: Session,
    code: str = "GM",
) -> Department:
    department = db.scalar(
        select(Department).where(
            Department.code
            == code.upper()
        )
    )

    if department is None:
        raise QueueActionError(
            "Department not found.",
            404,
        )

    return department


def get_doctor(
    db: Session,
    department: Department,
) -> Doctor:
    doctor = db.scalar(
        select(Doctor).where(
            Doctor.department_id
            == department.id
        )
    )

    if doctor is None:
        raise QueueActionError(
            "Doctor not found.",
            404,
        )

    return doctor


def get_latest_forecast(
    db: Session,
    token: Token,
) -> Forecast | None:
    return db.scalar(
        select(Forecast)
        .where(
            Forecast.token_id
            == token.id
        )
        .order_by(
            Forecast.model_version.desc(),
            Forecast.generated_at.desc(),
        )
        .limit(1)
    )


def add_queue_event(
    db: Session,
    department: Department,
    doctor: Doctor | None,
    event_type: str,
    message: str,
    token: Token | None = None,
    payload: dict | None = None,
    source: str = "SYSTEM",
) -> None:
    event = QueueEvent(
        department_id=department.id,
        doctor_id=(
            doctor.id
            if doctor
            else None
        ),
        token_id=(
            token.id
            if token
            else None
        ),
        event_type=event_type,
        source=source,
        message=message,
        payload=payload,
    )

    db.add(event)


def active_tokens(
    db: Session,
    department: Department,
) -> list[Token]:
    statement = (
        select(Token)
        .where(
            Token.department_id
            == department.id,

            Token.status.notin_(
                [
                    "COMPLETED",
                    "MISSED",
                ]
            ),
        )
        .order_by(
            Token.queue_position.is_(
                None
            ),
            Token.queue_position,
            Token.sequence_number,
        )
    )

    return list(
        db.scalars(
            statement
        ).all()
    )


# ==========================================================
# MONTE CARLO REFORECAST HELPER
# ==========================================================


def run_reforecast(
    db: Session,
    department: Department,
    doctor: Doctor,
    reason_code: str,
) -> dict:
    """
    Recalculate the complete active queue using the
    QueuePulse Monte Carlo forecasting engine.

    commit=False means the queue action, forecasts
    and audit/event records are committed together
    as one database transaction.
    """

    result = recalculate_queue_forecasts(
        db=db,
        department_code=department.code,
        reason_code=reason_code,
        commit=False,
    )

    add_queue_event(
        db=db,
        department=department,
        doctor=doctor,
        event_type="QUEUE_REFORECASTED",
        source="FORECAST_ENGINE",
        message=(
            "QueuePulse recalculated active "
            "waiting-time forecasts using "
            "Monte Carlo simulation."
        ),
        payload={
            "forecast_version":
                result[
                    "forecast_version"
                ],

            "reason_code":
                reason_code,

            "monte_carlo_runs":
                result[
                    "monte_carlo_runs"
                ],

            "model_source":
                result[
                    "model_source"
                ],

            "history_samples":
                result[
                    "history_samples"
                ],

            "service_time_minutes":
                result[
                    "service_time_minutes"
                ],
        },
    )

    return result


# ==========================================================
# PRIORITY INSERTION
# ==========================================================


def insert_priority_case(
    db: Session,
) -> dict:
    department = get_department(
        db
    )

    doctor = get_doctor(
        db,
        department,
    )

    existing = db.scalar(
        select(Token).where(
            Token.token_number
            == "P1-07"
        )
    )

    if existing is not None:
        raise QueueActionError(
            "Priority case P1-07 is already in the queue.",
            409,
        )

    serving = db.scalar(
        select(Token).where(
            Token.department_id
            == department.id,

            Token.status
            == "SERVING",
        )
    )

    if serving:
        insertion_position = (
            serving.queue_position
            or 0
        ) + 1

    else:
        insertion_position = 1

    downstream = list(
        db.scalars(
            select(Token)
            .where(
                Token.department_id
                == department.id,

                Token.queue_position
                >= insertion_position,

                Token.status.notin_(
                    [
                        "COMPLETED",
                        "MISSED",
                    ]
                ),
            )
            .order_by(
                Token.queue_position
            )
        ).all()
    )

    # Make room for priority patient.
    for token in downstream:
        if (
            token.queue_position
            is not None
        ):
            token.queue_position += 1

    visit = PatientVisit(
        department_id=department.id,
        patient_code="PAT-P107",
        display_name="Priority Patient",
        phone_number=None,
        phone_masked=None,
        channel="TRIAGE",
        checked_in=True,
    )

    db.add(visit)
    db.flush()

    priority_token = Token(
        visit_id=visit.id,
        department_id=department.id,
        doctor_id=doctor.id,

        token_number="P1-07",

        sequence_number=7,

        status="PRIORITY",

        priority_level=1,

        is_priority=True,

        queue_position=insertion_position,

        checked_in_at=utc_now(),
    )

    db.add(priority_token)

    db.flush()

    add_queue_event(
        db=db,
        department=department,
        doctor=doctor,
        token=priority_token,

        event_type="PRIORITY_INSERTED",

        source="TRIAGE",

        message=(
            "P1-07 was inserted immediately "
            "after the active consultation."
        ),

        payload={
            "priority_level": 1,
            "queue_position":
                insertion_position,
        },
    )

    # ======================================================
    # REAL FORECAST ENGINE
    # ======================================================

    forecast_result = run_reforecast(
        db=db,
        department=department,
        doctor=doctor,
        reason_code="PRIORITY_INSERTION",
    )

    # ======================================================
    # NOTIFY G-42 IF ITS FORECAST CHANGED
    # ======================================================

    g42 = db.scalar(
        select(Token).where(
            Token.token_number
            == "G-42"
        )
    )

    if g42:
        latest = get_latest_forecast(
            db,
            g42,
        )

        if latest:
            recipient = (
                g42.visit.phone_masked
                if g42.visit
                and g42.visit.phone_masked
                else "G-42"
            )

            notification = Notification(
                token_id=g42.id,

                channel="SMS",

                recipient=recipient,

                message=(
                    "QueuePulse G-42: "
                    "Your estimated waiting window "
                    "changed after a priority "
                    "clinical case entered the queue. "
                    f"Updated estimate: "
                    f"{latest.eta_min_minutes}-"
                    f"{latest.eta_max_minutes} minutes."
                ),

                status="QUEUED",
            )

            db.add(
                notification
            )

    db.commit()

    return {
        "action":
            "priority_inserted",

        "message":
            (
                "P1-07 inserted and "
                "Monte Carlo forecasts recalculated."
            ),

        "token_number":
            "P1-07",

        "doctor_status":
            doctor.status,

        "forecast_version":
            forecast_result[
                "forecast_version"
            ],
    }


# ==========================================================
# COMPLETE CONSULTATION
# ==========================================================


def complete_consultation(
    db: Session,
) -> dict:
    department = get_department(
        db
    )

    doctor = get_doctor(
        db,
        department,
    )

    serving = db.scalar(
        select(Token).where(
            Token.department_id
            == department.id,

            Token.status
            == "SERVING",
        )
    )

    if serving is None:
        raise QueueActionError(
            "No consultation is currently active.",
            409,
        )

    now = utc_now()

    serving.status = "COMPLETED"

    serving.completed_at = now

    doctor.status = "AVAILABLE"

    started_at = (
        serving.serving_at
        or now
    )

    started_for_duration = (
        started_at
    )

    if (
        started_for_duration.tzinfo
        is None
    ):
        started_for_duration = (
            started_for_duration.replace(
                tzinfo=timezone.utc
            )
        )

    duration_seconds = max(
        1,
        int(
            (
                now
                - started_for_duration
            ).total_seconds()
        ),
    )

    history = ConsultationHistory(
        token_id=serving.id,

        doctor_id=doctor.id,

        started_at=started_at,

        completed_at=now,

        duration_seconds=
            duration_seconds,

        outcome="COMPLETED",
    )

    db.add(history)

    add_queue_event(
        db=db,
        department=department,
        doctor=doctor,
        token=serving,

        event_type="CONSULTATION_COMPLETED",

        source="DOCTOR",

        message=(
            f"{serving.token_number} "
            "consultation completed."
        ),

        payload={
            "duration_seconds":
                duration_seconds,
        },
    )

    db.flush()

    # ======================================================
    # REAL FORECAST ENGINE
    # ======================================================

    forecast_result = run_reforecast(
        db=db,
        department=department,
        doctor=doctor,
        reason_code=(
            "CONSULTATION_COMPLETED"
        ),
    )

    db.commit()

    return {
        "action":
            "consultation_completed",

        "message":
            (
                f"{serving.token_number} "
                "consultation completed and "
                "queue forecasts recalculated."
            ),

        "token_number":
            serving.token_number,

        "doctor_status":
            doctor.status,

        "forecast_version":
            forecast_result[
                "forecast_version"
            ],
    }


# ==========================================================
# CALL NEXT PATIENT
# ==========================================================


def call_next_patient(
    db: Session,
) -> dict:
    department = get_department(
        db
    )

    doctor = get_doctor(
        db,
        department,
    )

    if (
        doctor.status
        == "PAUSED"
    ):
        raise QueueActionError(
            "Doctor is currently paused.",
            409,
        )

    serving = db.scalar(
        select(Token).where(
            Token.department_id
            == department.id,

            Token.status
            == "SERVING",
        )
    )

    if serving:
        raise QueueActionError(
            "Complete the active consultation first.",
            409,
        )

    already_called = db.scalar(
        select(Token).where(
            Token.department_id
            == department.id,

            Token.status
            == "CALLED",
        )
    )

    if already_called:
        raise QueueActionError(
            (
                f"{already_called.token_number} "
                "is already called."
            ),
            409,
        )

    candidates = active_tokens(
        db,
        department,
    )

    next_token = next(
        (
            token
            for token in candidates

            if token.status
            in {
                "PRIORITY",
                "READY",
                "WAITING",
                "NOT_ARRIVED",
                "CREATED",
            }
        ),
        None,
    )

    if next_token is None:
        raise QueueActionError(
            "No eligible patient is waiting.",
            404,
        )

    next_token.status = "CALLED"

    next_token.called_at = (
        utc_now()
    )

    add_queue_event(
        db=db,
        department=department,
        doctor=doctor,
        token=next_token,

        event_type="PATIENT_CALLED",

        source="DOCTOR",

        message=(
            f"{next_token.token_number} "
            "was called to Room 201."
        ),
    )

    if (
        next_token.visit
        and next_token.visit.phone_masked
    ):
        notification = Notification(
            token_id=next_token.id,

            channel="SMS",

            recipient=(
                next_token.visit.phone_masked
            ),

            message=(
                "QueuePulse: Token "
                f"{next_token.token_number}, "
                "please proceed to Room 201. "
                "You have been called."
            ),

            status="QUEUED",
        )

        db.add(notification)

    db.flush()

    # ======================================================
    # REAL FORECAST ENGINE
    # ======================================================

    forecast_result = run_reforecast(
        db=db,
        department=department,
        doctor=doctor,
        reason_code="PATIENT_CALLED",
    )

    db.commit()

    return {
        "action":
            "patient_called",

        "message":
            (
                f"{next_token.token_number} "
                "called."
            ),

        "token_number":
            next_token.token_number,

        "doctor_status":
            doctor.status,

        "forecast_version":
            forecast_result[
                "forecast_version"
            ],
    }


# ==========================================================
# START CONSULTATION
# ==========================================================


def start_consultation(
    db: Session,
) -> dict:
    department = get_department(
        db
    )

    doctor = get_doctor(
        db,
        department,
    )

    if (
        doctor.status
        == "PAUSED"
    ):
        raise QueueActionError(
            "Doctor is currently paused.",
            409,
        )

    serving = db.scalar(
        select(Token).where(
            Token.department_id
            == department.id,

            Token.status
            == "SERVING",
        )
    )

    if serving:
        raise QueueActionError(
            "Another consultation is already active.",
            409,
        )

    called = db.scalar(
        select(Token).where(
            Token.department_id
            == department.id,

            Token.status
            == "CALLED",
        )
    )

    if called is None:
        raise QueueActionError(
            "No patient has been called.",
            409,
        )

    called.status = "SERVING"

    called.serving_at = (
        utc_now()
    )

    doctor.status = "SERVING"

    add_queue_event(
        db=db,
        department=department,
        doctor=doctor,
        token=called,

        event_type="CONSULTATION_STARTED",

        source="DOCTOR",

        message=(
            f"{called.token_number} "
            "consultation started."
        ),
    )

    db.flush()

    # ======================================================
    # REAL FORECAST ENGINE
    # ======================================================

    forecast_result = run_reforecast(
        db=db,
        department=department,
        doctor=doctor,
        reason_code=(
            "CONSULTATION_STARTED"
        ),
    )

    db.commit()

    return {
        "action":
            "consultation_started",

        "message":
            (
                f"{called.token_number} "
                "is now being served."
            ),

        "token_number":
            called.token_number,

        "doctor_status":
            doctor.status,

        "forecast_version":
            forecast_result[
                "forecast_version"
            ],
    }


# ==========================================================
# NO-SHOW
# ==========================================================


def mark_no_show(
    db: Session,
) -> dict:
    department = get_department(
        db
    )

    doctor = get_doctor(
        db,
        department,
    )

    called = db.scalar(
        select(Token).where(
            Token.department_id
            == department.id,

            Token.status
            == "CALLED",
        )
    )

    if called is None:
        raise QueueActionError(
            "No called patient is waiting.",
            409,
        )

    called.status = "MISSED"

    add_queue_event(
        db=db,
        department=department,
        doctor=doctor,
        token=called,

        event_type="NO_SHOW",

        source="DOCTOR",

        message=(
            f"{called.token_number} "
            "was marked as a no-show."
        ),
    )

    db.flush()

    # ======================================================
    # REAL FORECAST ENGINE
    # ======================================================

    forecast_result = run_reforecast(
        db=db,
        department=department,
        doctor=doctor,
        reason_code="NO_SHOW",
    )

    db.commit()

    return {
        "action":
            "patient_no_show",

        "message":
            (
                f"{called.token_number} "
                "marked missed."
            ),

        "token_number":
            called.token_number,

        "doctor_status":
            doctor.status,

        "forecast_version":
            forecast_result[
                "forecast_version"
            ],
    }


# ==========================================================
# PAUSE DOCTOR
# ==========================================================


def pause_doctor(
    db: Session,
) -> dict:
    department = get_department(
        db
    )

    doctor = get_doctor(
        db,
        department,
    )

    if (
        doctor.status
        == "PAUSED"
    ):
        raise QueueActionError(
            "Doctor is already paused.",
            409,
        )

    serving = db.scalar(
        select(Token).where(
            Token.department_id
            == department.id,

            Token.status
            == "SERVING",
        )
    )

    if serving:
        raise QueueActionError(
            (
                "Complete the active "
                "consultation before "
                "pausing the doctor."
            ),
            409,
        )

    doctor.status = "PAUSED"

    add_queue_event(
        db=db,
        department=department,
        doctor=doctor,

        event_type="DOCTOR_PAUSED",

        source="DOCTOR",

        message=(
            "Dr. Meera Shah paused "
            "the consultation channel."
        ),
    )

    db.flush()

    # ======================================================
    # MONTE CARLO MODELS THE PAUSE DELAY
    # ======================================================

    forecast_result = run_reforecast(
        db=db,
        department=department,
        doctor=doctor,
        reason_code="DOCTOR_PAUSED",
    )

    db.commit()

    return {
        "action":
            "doctor_paused",

        "message":
            (
                "Doctor paused. "
                "Forecast engine recalculated "
                "the active queue."
            ),

        "token_number":
            None,

        "doctor_status":
            doctor.status,

        "forecast_version":
            forecast_result[
                "forecast_version"
            ],
    }


# ==========================================================
# RESUME DOCTOR
# ==========================================================


def resume_doctor(
    db: Session,
) -> dict:
    department = get_department(
        db
    )

    doctor = get_doctor(
        db,
        department,
    )

    if (
        doctor.status
        != "PAUSED"
    ):
        raise QueueActionError(
            "Doctor is not currently paused.",
            409,
        )

    doctor.status = "AVAILABLE"

    add_queue_event(
        db=db,
        department=department,
        doctor=doctor,

        event_type="DOCTOR_RESUMED",

        source="DOCTOR",

        message=(
            "Dr. Meera Shah resumed "
            "the consultation channel."
        ),
    )

    db.flush()

    forecast_result = run_reforecast(
        db=db,
        department=department,
        doctor=doctor,
        reason_code="DOCTOR_RESUMED",
    )

    db.commit()

    return {
        "action":
            "doctor_resumed",

        "message":
            (
                "Doctor resumed and "
                "queue forecasts recalculated."
            ),

        "token_number":
            None,

        "doctor_status":
            doctor.status,

        "forecast_version":
            forecast_result[
                "forecast_version"
            ],
    }


# ==========================================================
# RESET HACKATHON DEMO
# ==========================================================


def reset_demo(
    db: Session,
) -> dict:
    department = get_department(
        db
    )

    doctor = get_doctor(
        db,
        department,
    )

    priority_token = db.scalar(
        select(Token).where(
            Token.token_number
            == "P1-07"
        )
    )

    if priority_token:
        priority_visit_id = (
            priority_token.visit_id
        )

        db.execute(
            delete(Notification).where(
                Notification.token_id
                == priority_token.id
            )
        )

        db.execute(
            delete(Forecast).where(
                Forecast.token_id
                == priority_token.id
            )
        )

        db.execute(
            delete(QueueEvent).where(
                QueueEvent.token_id
                == priority_token.id
            )
        )

        db.execute(
            delete(
                ConsultationHistory
            ).where(
                ConsultationHistory.token_id
                == priority_token.id
            )
        )

        db.delete(
            priority_token
        )

        db.flush()

        priority_visit = db.get(
            PatientVisit,
            priority_visit_id,
        )

        if priority_visit:
            db.delete(
                priority_visit
            )

    original_data = {
        "G-31": {
            "position": 1,
            "status": "SERVING",
            "eta_min": 0,
            "eta_max": 0,
            "confidence": 0.93,
            "reason":
                "CURRENT_CONSULTATION",
        },

        "G-32": {
            "position": 2,
            "status": "READY",
            "eta_min": 8,
            "eta_max": 12,
            "confidence": 0.91,
            "reason":
                "NORMAL_FLOW",
        },

        "G-33": {
            "position": 3,
            "status": "WAITING",
            "eta_min": 18,
            "eta_max": 25,
            "confidence": 0.88,
            "reason":
                "NORMAL_FLOW",
        },

        "G-34": {
            "position": 4,
            "status": "WAITING",
            "eta_min": 27,
            "eta_max": 34,
            "confidence": 0.86,
            "reason":
                "NORMAL_FLOW",
        },

        "G-42": {
            "position": 5,
            "status": "WAITING",
            "eta_min": 40,
            "eta_max": 55,
            "confidence": 0.86,
            "reason":
                "NORMAL_FLOW",
        },
    }

    original_tokens = list(
        db.scalars(
            select(Token).where(
                Token.token_number.in_(
                    list(
                        original_data.keys()
                    )
                )
            )
        ).all()
    )

    original_token_ids = [
        token.id
        for token
        in original_tokens
    ]

    if original_token_ids:
        db.execute(
            delete(Forecast).where(
                Forecast.token_id.in_(
                    original_token_ids
                )
            )
        )

        db.execute(
            delete(Notification).where(
                Notification.token_id.in_(
                    original_token_ids
                )
            )
        )

        db.execute(
            delete(
                ConsultationHistory
            ).where(
                ConsultationHistory.token_id.in_(
                    original_token_ids
                )
            )
        )

    db.execute(
        delete(QueueEvent).where(
            QueueEvent.department_id
            == department.id
        )
    )

    now = utc_now()

    for token in original_tokens:
        config = original_data[
            token.token_number
        ]

        token.queue_position = (
            config[
                "position"
            ]
        )

        token.status = (
            config[
                "status"
            ]
        )

        token.is_priority = (
            False
        )

        token.priority_level = 0

        token.called_at = None

        token.completed_at = None

        token.serving_at = (
            now
            if token.token_number
            == "G-31"
            else None
        )

        forecast = Forecast(
            token_id=token.id,

            model_version=1,

            predicted_wait_minutes=(
                (
                    config[
                        "eta_min"
                    ]
                    + config[
                        "eta_max"
                    ]
                )
                / 2
            ),

            eta_min_minutes=config[
                "eta_min"
            ],

            eta_max_minutes=config[
                "eta_max"
            ],

            confidence_score=config[
                "confidence"
            ],

            confidence_label="HIGH",

            reason_code=config[
                "reason"
            ],

            metadata_json={
                "source":
                    "DEMO_RESET",

                "engine":
                    "INITIAL_DEMO_STATE",
            },
        )

        db.add(
            forecast
        )

    doctor.status = "SERVING"

    add_queue_event(
        db=db,
        department=department,
        doctor=doctor,

        event_type="FORECAST_ENGINE_STARTED",

        source="SYSTEM",

        message=(
            "QueuePulse forecast engine "
            "started for General Medicine."
        ),

        payload={
            "forecast_version": 1,
            "queue_size": 5,
        },
    )

    db.commit()

    return {
        "action":
            "demo_reset",

        "message":
            (
                "QueuePulse demo restored "
                "to the initial hospital state."
            ),

        "token_number":
            None,

        "doctor_status":
            doctor.status,

        "forecast_version": 1,
    }