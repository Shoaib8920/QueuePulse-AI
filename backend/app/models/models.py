from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.db.session import Base


def generate_uuid() -> str:
    return str(uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ==========================================================
# USER
# ==========================================================


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )

    name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    password_hash: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    role: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
        default="RECEPTIONIST",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
        onupdate=utc_now,
    )


# ==========================================================
# DEPARTMENT
# ==========================================================


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )

    name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
        unique=True,
    )

    code: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        unique=True,
        index=True,
    )

    room_label: Mapped[str | None] = mapped_column(
        String(60),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
    )

    doctors: Mapped[list[Doctor]] = relationship(
        back_populates="department",
    )

    patient_visits: Mapped[list[PatientVisit]] = relationship(
        back_populates="department",
    )

    tokens: Mapped[list[Token]] = relationship(
        back_populates="department",
    )


# ==========================================================
# DOCTOR
# ==========================================================


class Doctor(Base):
    __tablename__ = "doctors"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )

    department_id: Mapped[str] = mapped_column(
        ForeignKey("departments.id"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    room_label: Mapped[str] = mapped_column(
        String(60),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="AVAILABLE",
    )

    average_consultation_minutes: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=10.0,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
        onupdate=utc_now,
    )

    department: Mapped[Department] = relationship(
        back_populates="doctors",
    )

    tokens: Mapped[list[Token]] = relationship(
        back_populates="doctor",
    )

    consultation_history: Mapped[list[ConsultationHistory]] = relationship(
        back_populates="doctor",
    )


# ==========================================================
# PATIENT VISIT
# ==========================================================


class PatientVisit(Base):
    __tablename__ = "patient_visits"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )

    department_id: Mapped[str] = mapped_column(
        ForeignKey("departments.id"),
        nullable=False,
        index=True,
    )

    patient_code: Mapped[str] = mapped_column(
        String(60),
        nullable=False,
        index=True,
    )

    display_name: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
    )

    phone_number: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    phone_masked: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    channel: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="WEB",
    )

    checked_in: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
    )

    department: Mapped[Department] = relationship(
        back_populates="patient_visits",
    )

    token: Mapped[Token | None] = relationship(
        back_populates="visit",
        uselist=False,
    )


# ==========================================================
# TOKEN
# ==========================================================


class Token(Base):
    __tablename__ = "tokens"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )

    visit_id: Mapped[str] = mapped_column(
        ForeignKey("patient_visits.id"),
        nullable=False,
        unique=True,
        index=True,
    )

    department_id: Mapped[str] = mapped_column(
        ForeignKey("departments.id"),
        nullable=False,
        index=True,
    )

    doctor_id: Mapped[str | None] = mapped_column(
        ForeignKey("doctors.id"),
        nullable=True,
        index=True,
    )

    token_number: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        unique=True,
        index=True,
    )

    sequence_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="CREATED",
        index=True,
    )

    priority_level: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    is_priority: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    queue_position: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
    )

    checked_in_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    called_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    serving_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    visit: Mapped[PatientVisit] = relationship(
        back_populates="token",
    )

    department: Mapped[Department] = relationship(
        back_populates="tokens",
    )

    doctor: Mapped[Doctor | None] = relationship(
        back_populates="tokens",
    )

    events: Mapped[list[QueueEvent]] = relationship(
        back_populates="token",
    )

    forecasts: Mapped[list[Forecast]] = relationship(
        back_populates="token",
    )

    notifications: Mapped[list[Notification]] = relationship(
        back_populates="token",
    )

    consultation_history: Mapped[list[ConsultationHistory]] = relationship(
        back_populates="token",
    )


# ==========================================================
# QUEUE EVENT
# ==========================================================


class QueueEvent(Base):
    __tablename__ = "queue_events"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )

    department_id: Mapped[str | None] = mapped_column(
        ForeignKey("departments.id"),
        nullable=True,
        index=True,
    )

    doctor_id: Mapped[str | None] = mapped_column(
        ForeignKey("doctors.id"),
        nullable=True,
        index=True,
    )

    token_id: Mapped[str | None] = mapped_column(
        ForeignKey("tokens.id"),
        nullable=True,
        index=True,
    )

    event_type: Mapped[str] = mapped_column(
        String(60),
        nullable=False,
        index=True,
    )

    source: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
        default="SYSTEM",
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    payload: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
        index=True,
    )

    token: Mapped[Token | None] = relationship(
        back_populates="events",
    )


# ==========================================================
# FORECAST
# ==========================================================


class Forecast(Base):
    __tablename__ = "forecasts"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )

    token_id: Mapped[str] = mapped_column(
        ForeignKey("tokens.id"),
        nullable=False,
        index=True,
    )

    model_version: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    predicted_wait_minutes: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    eta_min_minutes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    eta_max_minutes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    confidence_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    confidence_label: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="MEDIUM",
    )

    reason_code: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
        default="NORMAL_FLOW",
    )

    metadata_json: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
        index=True,
    )

    token: Mapped[Token] = relationship(
        back_populates="forecasts",
    )


# ==========================================================
# CONSULTATION HISTORY
# ==========================================================


class ConsultationHistory(Base):
    __tablename__ = "consultation_history"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )

    token_id: Mapped[str] = mapped_column(
        ForeignKey("tokens.id"),
        nullable=False,
        index=True,
    )

    doctor_id: Mapped[str] = mapped_column(
        ForeignKey("doctors.id"),
        nullable=False,
        index=True,
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    duration_seconds: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    outcome: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="COMPLETED",
    )

    token: Mapped[Token] = relationship(
        back_populates="consultation_history",
    )

    doctor: Mapped[Doctor] = relationship(
        back_populates="consultation_history",
    )


# ==========================================================
# NOTIFICATION
# ==========================================================


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )

    token_id: Mapped[str] = mapped_column(
        ForeignKey("tokens.id"),
        nullable=False,
        index=True,
    )

    channel: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    recipient: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="QUEUED",
    )

    provider_message_id: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
    )

    sent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    token: Mapped[Token] = relationship(
        back_populates="notifications",
    )


# ==========================================================
# AUDIT EVENT
# ==========================================================


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )

    actor_user_id: Mapped[str | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    action: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
        index=True,
    )

    entity_type: Mapped[str] = mapped_column(
        String(60),
        nullable=False,
    )

    entity_id: Mapped[str | None] = mapped_column(
        String(36),
        nullable=True,
    )

    details: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
        index=True,
    )


# ==========================================================
# QUEUE CONFIGURATION
# ==========================================================


class QueueConfiguration(Base):
    __tablename__ = "queue_configurations"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )

    department_id: Mapped[str] = mapped_column(
        ForeignKey("departments.id"),
        nullable=False,
        unique=True,
        index=True,
    )

    default_service_minutes: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=10.0,
    )

    priority_service_minutes: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=14.0,
    )

    notification_threshold_minutes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=10,
    )

    monte_carlo_runs: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=300,
    )

    pwa_enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    sms_enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
        onupdate=utc_now,
    )