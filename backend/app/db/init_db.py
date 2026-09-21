from app.db.session import Base, engine

# Importing models registers every table
# with SQLAlchemy's Base metadata.
import app.models  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(
        bind=engine,
    )