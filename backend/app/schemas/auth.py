from pydantic import BaseModel


class TokenResponse(BaseModel):
    access_token: str

    token_type: str = "bearer"

    name: str

    email: str

    role: str


class CurrentUserResponse(BaseModel):
    id: str

    name: str

    email: str

    role: str

    is_active: bool