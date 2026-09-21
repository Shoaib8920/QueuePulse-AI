from __future__ import annotations

import random
import statistics

from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy import (
    desc,
    func,
    select,
)

from sqlalchemy.orm import Session

from app.models.models import (
    ConsultationHistory,
    Department,
    Doctor,
    Forecast,
    QueueConfiguration,
    Token,
)


ACTIVE_STATUSES = {
    "CREATED",
    "NOT_ARRIVED",
    "WAITING",
    "READY",
    "PRIORITY",
    "CALLED",
    "SERVING",
}


@dataclass
class ServiceTimeModel:
    center_minutes: float
    spread_minutes: float
    sample_count: int
    source: str


def utc_now() -> datetime:
    return datetime.now(
        timezone.utc
    )


def clamp(
    value: float,
    minimum: float,
    maximum: float,
) -> float:
    return max(
        minimum,
        min(
            maximum,
            value,
        ),
    )


# ==========================================================
# PERCENTILE
# ==========================================================


def percentile(
    values: list[float],
    probability: float,
) -> float:
    if not values:
        return 0.0

    ordered = sorted(
        values
    )

    if len(ordered) == 1:
        return ordered[0]

    position = (
        len(ordered) - 1
    ) * probability

    lower_index = int(
        position
    )

    upper_index = min(
        lower_index + 1,
        len(ordered) - 1,
    )

    fraction = (
        position
        - lower_index
    )

    lower = ordered[
        lower_index
    ]

    upper = ordered[
        upper_index
    ]

    return (
        lower
        + (
            upper - lower
        )
        * fraction
    )


# ==========================================================
# CONFIGURATION
# ==========================================================


def get_configuration(
    db: Session,
    department: Department,
) -> QueueConfiguration:
    configuration = db.scalar(
        select(
            QueueConfiguration
        ).where(
            QueueConfiguration.department_id
            == department.id
        )
    )

    if configuration:
        return configuration

    configuration = (
        QueueConfiguration(
            department_id=department.id,
            default_service_minutes=10.0,
            priority_service_minutes=14.0,
            notification_threshold_minutes=10,
            monte_carlo_runs=300,
            pwa_enabled=True,
            sms_enabled=True,
        )
    )

    db.add(
        configuration
    )

    db.flush()

    return configuration


# ==========================================================
# CONSULTATION HISTORY
# ==========================================================


def get_service_time_model(
    db: Session,
    doctor: Doctor,
    configuration: QueueConfiguration,
) -> ServiceTimeModel:
    durations = list(
        db.scalars(
            select(
                ConsultationHistory.duration_seconds
            )
            .where(
                ConsultationHistory.doctor_id
                == doctor.id,

                ConsultationHistory.duration_seconds
                .is_not(None),

                ConsultationHistory.duration_seconds
                > 60,

                ConsultationHistory.duration_seconds
                < 7200,
            )
            .order_by(
                desc(
                    ConsultationHistory.completed_at
                )
            )
            .limit(30)
        ).all()
    )

    minutes = [
        duration / 60.0
        for duration in durations
        if duration is not None
    ]

    baseline = float(
        configuration.default_service_minutes
    )

    doctor_baseline = float(
        doctor.average_consultation_minutes
        or baseline
    )

    # ------------------------------------------------------
    # No consultation history yet
    # ------------------------------------------------------

    if not minutes:
        center = (
            0.70
            * doctor_baseline
            + 0.30
            * baseline
        )

        spread = max(
            2.0,
            center * 0.25,
        )

        return ServiceTimeModel(
            center_minutes=center,
            spread_minutes=spread,
            sample_count=0,
            source="DOCTOR_BASELINE",
        )

    # ------------------------------------------------------
    # Robust statistics
    # ------------------------------------------------------

    recent = minutes[:10]

    recent_median = (
        statistics.median(
            recent
        )
    )

    history_median = (
        statistics.median(
            minutes
        )
    )

    # Weighted model:
    #
    # 40% recent doctor pace
    # 40% doctor history
    # 20% department baseline

    center = (
        0.40
        * recent_median
        + 0.40
        * history_median
        + 0.20
        * baseline
    )

    deviations = [
        abs(
            value
            - history_median
        )
        for value in minutes
    ]

    mad = (
        statistics.median(
            deviations
        )
        if deviations
        else 0.0
    )

    robust_sigma = (
        1.4826 * mad
    )

    if robust_sigma <= 0:
        robust_sigma = (
            center * 0.20
        )

    spread = max(
        1.5,
        robust_sigma,
    )

    return ServiceTimeModel(
        center_minutes=center,
        spread_minutes=spread,
        sample_count=len(
            minutes
        ),
        source="CONSULTATION_HISTORY",
    )


# ==========================================================
# SERVICE TIME SAMPLING
# ==========================================================


def sample_service_time(
    model: ServiceTimeModel,
    priority: bool,
    configuration: QueueConfiguration,
) -> float:
    if priority:
        center = float(
            configuration.priority_service_minutes
        )

        spread = max(
            2.0,
            center * 0.22,
        )

    else:
        center = (
            model.center_minutes
        )

        spread = (
            model.spread_minutes
        )

    sample = random.gauss(
        center,
        spread,
    )

    # Do not allow impossible
    # consultation durations.

    return clamp(
        sample,
        2.0,
        60.0,
    )


# ==========================================================
# CURRENT CONSULTATION RESIDUAL
# ==========================================================


def serving_residual_minutes(
    token: Token,
    model: ServiceTimeModel,
    configuration: QueueConfiguration,
) -> float:
    sampled_duration = (
        sample_service_time(
            model=model,
            priority=token.is_priority,
            configuration=configuration,
        )
    )

    if token.serving_at is None:
        return sampled_duration

    serving_at = (
        token.serving_at
    )

    if (
        serving_at.tzinfo
        is None
    ):
        serving_at = serving_at.replace(
            tzinfo=timezone.utc
        )

    elapsed_seconds = (
        utc_now()
        - serving_at
    ).total_seconds()

    elapsed_minutes = max(
        0.0,
        elapsed_seconds
        / 60.0,
    )

    return max(
        1.0,
        sampled_duration
        - elapsed_minutes,
    )


# ==========================================================
# CONFIDENCE
# ==========================================================


def calculate_confidence(
    sample_count: int,
    p20: float,
    p80: float,
    p50: float,
) -> tuple[float, str]:
    if sample_count >= 20:
        history_score = 0.94

    elif sample_count >= 10:
        history_score = 0.89

    elif sample_count >= 5:
        history_score = 0.84

    elif sample_count >= 2:
        history_score = 0.78

    else:
        history_score = 0.72

    interval_width = max(
        0.0,
        p80 - p20,
    )

    relative_width = (
        interval_width
        / max(
            10.0,
            p50,
        )
    )

    width_penalty = min(
        0.15,
        relative_width
        * 0.10,
    )

    confidence = clamp(
        history_score
        - width_penalty,
        0.55,
        0.96,
    )

    if confidence >= 0.82:
        label = "HIGH"

    elif confidence >= 0.68:
        label = "MEDIUM"

    else:
        label = "LOW"

    return (
        round(
            confidence,
            2,
        ),
        label,
    )


# ==========================================================
# FORECAST VERSION
# ==========================================================


def next_forecast_version(
    db: Session,
) -> int:
    current = db.scalar(
        select(
            func.max(
                Forecast.model_version
            )
        )
    )

    return int(
        current or 0
    ) + 1


# ==========================================================
# MONTE CARLO ENGINE
# ==========================================================


def recalculate_queue_forecasts(
    db: Session,
    department_code: str = "GM",
    reason_code: str = "LIVE_REFORECAST",
    commit: bool = True,
) -> dict:
    department = db.scalar(
        select(
            Department
        ).where(
            Department.code
            == department_code.upper()
        )
    )

    if department is None:
        raise ValueError(
            "Department not found."
        )

    doctor = db.scalar(
        select(
            Doctor
        ).where(
            Doctor.department_id
            == department.id,
            Doctor.is_active
            .is_(True),
        )
    )

    if doctor is None:
        raise ValueError(
            "Active doctor not found."
        )

    configuration = (
        get_configuration(
            db,
            department,
        )
    )

    service_model = (
        get_service_time_model(
            db,
            doctor,
            configuration,
        )
    )

    tokens = list(
        db.scalars(
            select(
                Token
            )
            .where(
                Token.department_id
                == department.id,

                Token.status.in_(
                    ACTIVE_STATUSES
                ),
            )
            .order_by(
                Token.queue_position
                .is_(None),

                Token.queue_position,

                Token.sequence_number,
            )
        ).all()
    )

    if not tokens:
        return {
            "forecast_version":
                next_forecast_version(
                    db
                ),

            "model_source":
                service_model.source,

            "service_time_minutes":
                round(
                    service_model.center_minutes,
                    2,
                ),

            "history_samples":
                service_model.sample_count,

            "monte_carlo_runs":
                configuration.monte_carlo_runs,

            "forecasts":
                [],
        }

    simulations = max(
        100,
        int(
            configuration.monte_carlo_runs
        ),
    )

    waiting_samples: dict[
        str,
        list[float],
    ] = {
        token.id: []
        for token in tokens
    }

    # ------------------------------------------------------
    # Run simulations
    # ------------------------------------------------------

    for _ in range(
        simulations
    ):
        cursor = 0.0

        if (
            doctor.status
            == "PAUSED"
        ):
            # Temporary pause uncertainty.
            cursor += random.uniform(
                10.0,
                20.0,
            )

        for token in tokens:
            # ----------------------------------------------
            # Current consultation
            # ----------------------------------------------

            if (
                token.status
                == "SERVING"
            ):
                waiting_samples[
                    token.id
                ].append(
                    0.0
                )

                cursor += (
                    serving_residual_minutes(
                        token=token,
                        model=service_model,
                        configuration=configuration,
                    )
                )

                continue

            # ----------------------------------------------
            # Called patient
            # ----------------------------------------------

            if (
                token.status
                == "CALLED"
            ):
                waiting_samples[
                    token.id
                ].append(
                    max(
                        0.0,
                        cursor,
                    )
                )

                # Small room-entry delay.
                cursor += random.uniform(
                    1.0,
                    3.0,
                )

                cursor += (
                    sample_service_time(
                        model=service_model,
                        priority=token.is_priority,
                        configuration=configuration,
                    )
                )

                continue

            # ----------------------------------------------
            # Remaining queue
            # ----------------------------------------------

            waiting_samples[
                token.id
            ].append(
                max(
                    0.0,
                    cursor,
                )
            )

            cursor += (
                sample_service_time(
                    model=service_model,
                    priority=token.is_priority,
                    configuration=configuration,
                )
            )

    # ------------------------------------------------------
    # Persist forecasts
    # ------------------------------------------------------

    version = (
        next_forecast_version(
            db
        )
    )

    results = []

    for token in tokens:
        samples = (
            waiting_samples[
                token.id
            ]
        )

        p20 = percentile(
            samples,
            0.20,
        )

        p50 = percentile(
            samples,
            0.50,
        )

        p80 = percentile(
            samples,
            0.80,
        )

        confidence_score, confidence_label = (
            calculate_confidence(
                sample_count=service_model.sample_count,
                p20=p20,
                p80=p80,
                p50=p50,
            )
        )

        eta_min = max(
            0,
            round(
                p20
            ),
        )

        eta_max = max(
            eta_min,
            round(
                p80
            ),
        )

        forecast = Forecast(
            token_id=token.id,

            model_version=version,

            predicted_wait_minutes=round(
                p50,
                2,
            ),

            eta_min_minutes=eta_min,

            eta_max_minutes=eta_max,

            confidence_score=confidence_score,

            confidence_label=confidence_label,

            reason_code=reason_code,

            metadata_json={
                "engine":
                    "MONTE_CARLO",

                "simulations":
                    simulations,

                "service_model":
                    service_model.source,

                "service_center_minutes":
                    round(
                        service_model.center_minutes,
                        2,
                    ),

                "service_spread_minutes":
                    round(
                        service_model.spread_minutes,
                        2,
                    ),

                "history_samples":
                    service_model.sample_count,

                "percentiles": {
                    "p20":
                        round(
                            p20,
                            2,
                        ),

                    "p50":
                        round(
                            p50,
                            2,
                        ),

                    "p80":
                        round(
                            p80,
                            2,
                        ),
                },
            },
        )

        db.add(
            forecast
        )

        results.append(
            {
                "token_number":
                    token.token_number,

                "status":
                    token.status,

                "eta_min_minutes":
                    eta_min,

                "predicted_wait_minutes":
                    round(
                        p50,
                        2,
                    ),

                "eta_max_minutes":
                    eta_max,

                "confidence_score":
                    confidence_score,

                "confidence_label":
                    confidence_label,
            }
        )

    if commit:
        db.commit()

    else:
        db.flush()

    return {
        "forecast_version":
            version,

        "model_source":
            service_model.source,

        "service_time_minutes":
            round(
                service_model.center_minutes,
                2,
            ),

        "service_time_spread":
            round(
                service_model.spread_minutes,
                2,
            ),

        "history_samples":
            service_model.sample_count,

        "monte_carlo_runs":
            simulations,

        "forecasts":
            results,
    }