from pydantic import BaseModel


class ForecastItemResponse(
    BaseModel
):
    token_number: str

    status: str

    eta_min_minutes: int

    predicted_wait_minutes: float

    eta_max_minutes: int

    confidence_score: float

    confidence_label: str


class ForecastRecalculationResponse(
    BaseModel
):
    forecast_version: int

    model_source: str

    service_time_minutes: float

    service_time_spread: float

    history_samples: int

    monte_carlo_runs: int

    forecasts: list[
        ForecastItemResponse
    ]