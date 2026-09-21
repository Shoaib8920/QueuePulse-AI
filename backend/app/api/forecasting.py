from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.core.websocket_manager import (
    realtime_manager,
)

from app.db.session import (
    get_db,
)

from app.schemas.forecasting import (
    ForecastRecalculationResponse,
)

from app.services.forecast_engine import (
    recalculate_queue_forecasts,
)


router = APIRouter(
    prefix="/api/v1",
    tags=["Forecasting"],
)


@router.post(
    "/forecast/recalculate",
    response_model=ForecastRecalculationResponse,
)
async def recalculate_forecast(
    db: Session = Depends(
        get_db
    ),
):
    try:
        result = (
            recalculate_queue_forecasts(
                db=db,
                department_code="GM",
                reason_code=(
                    "MANUAL_MONTE_CARLO_REFORECAST"
                ),
                commit=True,
            )
        )

        await realtime_manager.broadcast(
            {
                "type":
                    "queue.updated",

                "action":
                    "forecast_recalculated",

                "message":
                    "Monte Carlo queue forecast recalculated.",

                "forecast_version":
                    result[
                        "forecast_version"
                    ],
            }
        )

        return result

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=404,
            detail=str(
                error
            ),
        )

    except Exception:
        db.rollback()
        raise