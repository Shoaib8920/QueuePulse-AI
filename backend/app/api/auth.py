from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from fastapi.security import (
    OAuth2PasswordRequestForm,
)

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_user,
)

from app.core.security import (
    create_access_token,
    verify_password,
)

from app.db.session import (
    get_db,
)

from app.models.models import (
    AuditEvent,
    User,
)

from app.schemas.auth import (
    CurrentUserResponse,
    TokenResponse,
)


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(
        get_db
    ),
):
    email = (
        form_data.username
        .strip()
        .lower()
    )

    user = db.scalar(
        select(User).where(
            User.email == email
        )
    )

    if (
        user is None
        or user.password_hash
        is None
        or not verify_password(
            form_data.password,
            user.password_hash,
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Incorrect email or password."
            ),
            headers={
                "WWW-Authenticate":
                    "Bearer",
            },
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail=(
                "This account is inactive."
            ),
        )

    access_token = (
        create_access_token(
            subject=user.email,
            role=user.role,
        )
    )

    db.add(
        AuditEvent(
            actor_user_id=user.id,
            action="AUTH_LOGIN",
            entity_type="USER",
            entity_id=user.id,
            details={
                "role":
                    user.role,
                "email":
                    user.email,
            },
        )
    )

    db.commit()

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        name=user.name,
        email=user.email,
        role=user.role,
    )


@router.get(
    "/me",
    response_model=CurrentUserResponse,
)
def get_me(
    current_user: User = Depends(
        get_current_user
    ),
):
    return CurrentUserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
    )