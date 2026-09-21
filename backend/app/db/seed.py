from datetime import datetime, timezone

from sqlalchemy import select

from app.db.init_db import init_db
from app.db.session import SessionLocal

from app.models.models import (
    Department,
    Doctor,
    Forecast,
    PatientVisit,
    QueueConfiguration,
    QueueEvent,
    Token,
    User,
)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def seed_database() -> None:
    init_db()

    db = SessionLocal()

    try:
        # ==================================================
        # CHECK IF DEMO DATA ALREADY EXISTS
        # ==================================================

        existing_department = db.scalar(
            select(Department).where(
                Department.code == "GM"
            )
        )

        if existing_department:
            print(
                "QueuePulse demo data already exists."
            )
            return

        # ==================================================
        # OPERATOR
        # ==================================================

        operator = User(
            name="QueuePulse Operator",
            email="operator@queuepulse.local",
            password_hash=None,
            role="OPERATIONS_MANAGER",
            is_active=True,
        )

        db.add(operator)

        # ==================================================
        # DEPARTMENT
        # ==================================================

        department = Department(
            name="General Medicine",
            code="GM",
            room_label="Room 201",
            is_active=True,
        )

        db.add(department)
        db.flush()

        # ==================================================
        # DOCTOR
        # ==================================================

        doctor = Doctor(
            department_id=department.id,
            name="Dr. Meera Shah",
            room_label="Room 201",
            status="SERVING",
            average_consultation_minutes=10.0,
            is_active=True,
        )

        db.add(doctor)
        db.flush()

        # ==================================================
        # QUEUE CONFIGURATION
        # ==================================================

        queue_config = QueueConfiguration(
            department_id=department.id,
            default_service_minutes=10.0,
            priority_service_minutes=14.0,
            notification_threshold_minutes=10,
            monte_carlo_runs=300,
            pwa_enabled=True,
            sms_enabled=True,
        )

        db.add(queue_config)

        # ==================================================
        # PATIENT DATA
        # ==================================================

        patients = [
            {
                "patient_code": "PAT-G31",
                "display_name": "Patient G-31",
                "phone_number": "+919800003101",
                "phone_masked": "+91 98••• 3101",
                "channel": "WEB",
                "checked_in": True,
                "token": "G-31",
                "sequence_number": 31,
                "status": "SERVING",
                "priority_level": 0,
                "is_priority": False,
                "queue_position": 1,
                "eta_min": 0,
                "eta_max": 0,
                "confidence": 0.93,
                "reason": "CURRENT_CONSULTATION",
            },
            {
                "patient_code": "PAT-G32",
                "display_name": "Patient G-32",
                "phone_number": "+919800003202",
                "phone_masked": "+91 98••• 3202",
                "channel": "WEB",
                "checked_in": True,
                "token": "G-32",
                "sequence_number": 32,
                "status": "READY",
                "priority_level": 0,
                "is_priority": False,
                "queue_position": 2,
                "eta_min": 8,
                "eta_max": 12,
                "confidence": 0.91,
                "reason": "NORMAL_FLOW",
            },
            {
                "patient_code": "PAT-G33",
                "display_name": "Patient G-33",
                "phone_number": "+919800003303",
                "phone_masked": "+91 98••• 3303",
                "channel": "WEB",
                "checked_in": False,
                "token": "G-33",
                "sequence_number": 33,
                "status": "WAITING",
                "priority_level": 0,
                "is_priority": False,
                "queue_position": 3,
                "eta_min": 18,
                "eta_max": 25,
                "confidence": 0.88,
                "reason": "NORMAL_FLOW",
            },
            {
                "patient_code": "PAT-G34",
                "display_name": "Patient G-34",
                "phone_number": "+919800003404",
                "phone_masked": "+91 98••• 3404",
                "channel": "WEB",
                "checked_in": False,
                "token": "G-34",
                "sequence_number": 34,
                "status": "WAITING",
                "priority_level": 0,
                "is_priority": False,
                "queue_position": 4,
                "eta_min": 27,
                "eta_max": 34,
                "confidence": 0.86,
                "reason": "NORMAL_FLOW",
            },
            {
                "patient_code": "PAT-G42",
                "display_name": "Patient G-42",
                "phone_number": "+919800004210",
                "phone_masked": "+91 98••• 4210",
                "channel": "SMS",
                "checked_in": False,
                "token": "G-42",
                "sequence_number": 42,
                "status": "WAITING",
                "priority_level": 0,
                "is_priority": False,
                "queue_position": 5,
                "eta_min": 40,
                "eta_max": 55,
                "confidence": 0.86,
                "reason": "NORMAL_FLOW",
            },
        ]

        # ==================================================
        # CREATE VISITS, TOKENS AND FORECASTS
        # ==================================================

        for patient_data in patients:
            visit = PatientVisit(
                department_id=department.id,
                patient_code=patient_data[
                    "patient_code"
                ],
                display_name=patient_data[
                    "display_name"
                ],
                phone_number=patient_data[
                    "phone_number"
                ],
                phone_masked=patient_data[
                    "phone_masked"
                ],
                channel=patient_data[
                    "channel"
                ],
                checked_in=patient_data[
                    "checked_in"
                ],
            )

            db.add(visit)
            db.flush()

            token = Token(
                visit_id=visit.id,
                department_id=department.id,
                doctor_id=doctor.id,
                token_number=patient_data[
                    "token"
                ],
                sequence_number=patient_data[
                    "sequence_number"
                ],
                status=patient_data[
                    "status"
                ],
                priority_level=patient_data[
                    "priority_level"
                ],
                is_priority=patient_data[
                    "is_priority"
                ],
                queue_position=patient_data[
                    "queue_position"
                ],
                checked_in_at=(
                    utc_now()
                    if patient_data[
                        "checked_in"
                    ]
                    else None
                ),
                serving_at=(
                    utc_now()
                    if patient_data[
                        "status"
                    ]
                    == "SERVING"
                    else None
                ),
            )

            db.add(token)
            db.flush()

            forecast = Forecast(
                token_id=token.id,
                model_version=1,
                predicted_wait_minutes=(
                    (
                        patient_data[
                            "eta_min"
                        ]
                        + patient_data[
                            "eta_max"
                        ]
                    )
                    / 2
                ),
                eta_min_minutes=patient_data[
                    "eta_min"
                ],
                eta_max_minutes=patient_data[
                    "eta_max"
                ],
                confidence_score=patient_data[
                    "confidence"
                ],
                confidence_label="HIGH",
                reason_code=patient_data[
                    "reason"
                ],
                metadata_json={
                    "source": "demo_seed",
                    "department": "General Medicine",
                },
            )

            db.add(forecast)

        # ==================================================
        # INITIAL QUEUE EVENT
        # ==================================================

        queue_event = QueueEvent(
            department_id=department.id,
            doctor_id=doctor.id,
            token_id=None,
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

        db.add(queue_event)

        db.commit()

        print(
            "QueuePulse demo database seeded successfully."
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()