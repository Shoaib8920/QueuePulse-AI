from collections.abc import Callable

from fastapi import (
    Depends,
    HTTPException,
    status,
)

from fastapi.security import (
    OAuth2PasswordBearer,
)

from jose import (
    JWTError,
    jwt,
)

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import (
    ALGORITHM,
    SECRET_KEY,
)

from app.db.session import (
    get_db,
)

from app.models.models import (
    User,
)


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login"
)


def get_current_user(
    token: str = Depends(
        oauth2_scheme
    ),
    db: Session = Depends(
        get_db
    ),
) -> User:
    credentials_exception = (
        HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Could not validate authentication."
            ),
            headers={
                "WWW-Authenticate":
                    "Bearer",
            },
        )
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[
                ALGORITHM,
            ],
        )

        email = payload.get(
            "sub"
        )

        if not email:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.scalar(
        select(User).where(
            User.email == email
        )
    )

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail=(
                "This user account is inactive."
            ),
        )

    return user


def require_roles(
    *allowed_roles: str,
) -> Callable:
    def role_checker(
        current_user: User = Depends(
            get_current_user
        ),
    ) -> User:
        if (
            current_user.role
            not in allowed_roles
        ):
            raise HTTPException(
                status_code=403,
                detail=(
                    "You do not have permission "
                    "to perform this action."
                ),
            )

        return current_user

    return role_checker