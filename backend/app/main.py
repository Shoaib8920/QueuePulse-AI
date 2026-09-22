from contextlib import asynccontextmanager

from fastapi import FastAPI

from fastapi.middleware.cors import (
    CORSMiddleware,
)

from sqlalchemy import text

from sqlalchemy.exc import (
    SQLAlchemyError,
)

from app.api.actions import (
    router as actions_router,
)

from app.api.audit import (
    router as audit_router,
)

from app.api.auth import (
    router as auth_router,
)

from app.api.forecasting import (
    router as forecasting_router,
)

from app.api.routes import (
    router as api_router,
)

from app.api.websocket import (
    router as websocket_router,
)

from app.db.init_db import (
    init_db,
)

from app.db.session import (
    SessionLocal,
)


@asynccontextmanager
async def lifespan(
    app: FastAPI,
):
    init_db()

    print(
        "QueuePulse database initialized."
    )

    print(
        "QueuePulse authentication ready."
    )

    print(
        "QueuePulse realtime service ready."
    )

    print(
        "QueuePulse forecasting engine ready."
    )

    yield


app = FastAPI(
    title="QueuePulse AI API",

    description=(
        "Real-time OPD queue intelligence, "
        "forecasting and patient coordination API."
    ),

    version="1.0.0",

    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=[
        "*",
    ],

    allow_headers=[
        "*",
    ],
)


app.include_router(
    auth_router
)

app.include_router(
    api_router
)

app.include_router(
    actions_router
)

app.include_router(
    forecasting_router
)

app.include_router(
    audit_router
)

app.include_router(
    websocket_router
)


@app.get(
    "/",
    tags=[
        "System",
    ],
)
def root():
    return {
        "service":
            "QueuePulse AI",

        "status":
            "online",

        "version":
            "1.0.0",

        "authentication":
            "JWT",

        "api":
            "/api/v1",

        "websocket":
            "/ws/queue",

        "docs":
            "/docs",
    }


@app.get(
    "/health",
    tags=[
        "System",
    ],
)
def health_check():
    db = SessionLocal()

    try:
        db.execute(
            text(
                "SELECT 1"
            )
        )

        return {
            "status":
                "healthy",

            "database":
                "connected",

            "api":
                "online",

            "authentication":
                "jwt",

            "forecast_engine":
                "monte-carlo",

            "websocket":
                "online",
        }

    except SQLAlchemyError as error:
        return {
            "status":
                "degraded",

            "database":
                "error",

            "detail":
                str(
                    error
                ),
        }

    finally:
        db.close()