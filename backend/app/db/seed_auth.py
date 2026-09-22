from sqlalchemy import select

from app.core.security import (
    hash_password,
)

from app.db.init_db import (
    init_db,
)

from app.db.session import (
    SessionLocal,
)

from app.models.models import (
    User,
)


DEMO_USERS = [
    {
        "name":
            "QueuePulse Administrator",

        "email":
            "admin@queuepulse.local",

        "password":
            "Admin@123",

        "role":
            "ADMIN",
    },

    {
        "name":
            "OPD Operations Manager",

        "email":
            "operator@queuepulse.local",

        "password":
            "Ops@123",

        "role":
            "OPERATIONS_MANAGER",
    },

    {
        "name":
            "Triage Officer",

        "email":
            "triage@queuepulse.local",

        "password":
            "Triage@123",

        "role":
            "TRIAGE_STAFF",
    },

    {
        "name":
            "Dr. Meera Shah",

        "email":
            "doctor@queuepulse.local",

        "password":
            "Doctor@123",

        "role":
            "DOCTOR",
    },

    {
        "name":
            "OPD Reception",

        "email":
            "reception@queuepulse.local",

        "password":
            "Reception@123",

        "role":
            "RECEPTIONIST",
    },
]


def seed_auth_users():
    init_db()

    db = SessionLocal()

    try:
        for item in DEMO_USERS:
            user = db.scalar(
                select(User).where(
                    User.email
                    == item[
                        "email"
                    ]
                )
            )

            password_hash = (
                hash_password(
                    item[
                        "password"
                    ]
                )
            )

            if user:
                user.name = (
                    item[
                        "name"
                    ]
                )

                user.role = (
                    item[
                        "role"
                    ]
                )

                user.password_hash = (
                    password_hash
                )

                user.is_active = True

            else:
                user = User(
                    name=item[
                        "name"
                    ],

                    email=item[
                        "email"
                    ],

                    password_hash=
                        password_hash,

                    role=item[
                        "role"
                    ],

                    is_active=True,
                )

                db.add(
                    user
                )

        db.commit()

        print(
            "QueuePulse authentication users seeded successfully."
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_auth_users()