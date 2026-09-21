from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
)

from app.core.websocket_manager import (
    realtime_manager,
)


router = APIRouter(
    tags=["Realtime"],
)


@router.websocket(
    "/ws/queue"
)
async def queue_websocket(
    websocket: WebSocket,
):
    await realtime_manager.connect(
        websocket
    )

    try:
        await realtime_manager.send_personal_message(
            websocket,
            {
                "type":
                    "connected",

                "message":
                    "Connected to QueuePulse realtime service.",
            },
        )

        while True:
            message = await websocket.receive_text()

            if message == "ping":
                await websocket.send_json(
                    {
                        "type": "pong"
                    }
                )

    except WebSocketDisconnect:
        realtime_manager.disconnect(
            websocket
        )

    except Exception:
        realtime_manager.disconnect(
            websocket
        )