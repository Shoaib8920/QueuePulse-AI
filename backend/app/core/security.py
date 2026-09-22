import os

from datetime import (
    datetime,
    timedelta,
    timezone,
)

from jose import jwt

from passlib.context import (
    CryptContext,
)


SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "queuepulse-development-secret-change-before-deployment",
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 480


password_context = CryptContext(
    schemes=[
        "argon2",
    ],
    deprecated="auto",
)


def hash_password(
    password: str,
) -> str:
    return password_context.hash(
        password
    )


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return password_context.verify(
        plain_password,
        hashed_password,
    )


def create_access_token(
    subject: str,
    role: str,
) -> str:
    now = datetime.now(
        timezone.utc
    )

    expires = now + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": subject,
        "role": role,
        "iat": now,
        "exp": expires,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )