from pydantic import BaseModel


class ActionResponse(BaseModel):
    success: bool
    action: str
    message: str

    token_number: str | None = None
    doctor_status: str | None = None
    forecast_version: int