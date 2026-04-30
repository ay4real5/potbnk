from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import get_settings

SessionLocal = sessionmaker(autocommit=False, autoflush=False)

Base = declarative_base()


@lru_cache
def get_engine():
    return create_engine(get_settings().database_url)


def get_db():
    db = SessionLocal(bind=get_engine())
    try:
        yield db
    finally:
        db.close()
