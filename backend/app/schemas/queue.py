from datetime import datetime

from pydantic import BaseModel


class ForecastResponse(BaseModel):
    model_version: int
    predicted_wait_minutes: float
    eta_min_minutes: int
    eta_max_minutes: int
    confidence_score: float
    confidence_label: str
    reason_code: str
    generated_at: datetime


class PatientResponse(BaseModel):
    patient_code: str
    display_name: str | None
    phone_masked: str | None
    channel: str
    checked_in: bool


class DoctorSummaryResponse(BaseModel):
    id: str
    name: str
    room_label: str
    status: str


class QueueTokenResponse(BaseModel):
    id: str
    token_number: str

    status: str

    priority_level: int
    is_priority: bool

    queue_position: int | None

    department: str
    department_code: str

    patient: PatientResponse

    doctor: DoctorSummaryResponse | None

    latest_forecast: ForecastResponse | None


class QueueResponse(BaseModel):
    department: str
    department_code: str

    active_count: int
    forecast_version: int

    queue: list[QueueTokenResponse]


class DoctorResponse(BaseModel):
    id: str

    name: str
    department: str
    department_code: str

    room_label: str
    status: str

    average_consultation_minutes: float

    is_active: bool


class QueueEventResponse(BaseModel):
    id: str

    event_type: str
    source: str

    message: str

    token_number: str | None

    created_at: datetime

    payload: dict | None


class TokenDetailResponse(BaseModel):
    id: str

    token_number: str
    status: str

    priority_level: int
    is_priority: bool

    queue_position: int | None

    department: str
    department_code: str

    patient: PatientResponse

    doctor: DoctorSummaryResponse | None

    latest_forecast: ForecastResponse | None

    created_at: datetime
    checked_in_at: datetime | None
    called_at: datetime | None
    serving_at: datetime | None
    completed_at: datetime | None