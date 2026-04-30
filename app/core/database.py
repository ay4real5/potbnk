import logging
from threading import Lock
from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import get_settings

SessionLocal = sessionmaker(autocommit=False, autoflush=False)

Base = declarative_base()
logger = logging.getLogger("hunch.database")
_schema_lock = Lock()
_schema_ready = False


@lru_cache
def get_engine():
    database_url = get_settings().database_url
    if database_url.startswith(("postgres://", "postgresql://")) and "sslmode=" not in database_url:
        separator = "&" if "?" in database_url else "?"
        database_url = f"{database_url}{separator}sslmode=require"
    return create_engine(database_url)


def ensure_schema():
    global _schema_ready
    if _schema_ready:
        return
    if not get_settings().auto_create_tables:
        return
    with _schema_lock:
        if _schema_ready:
            return
        Base.metadata.create_all(bind=get_engine())
        _schema_ready = True
        logger.info("Database schema check completed.")


def get_db():
    ensure_schema()
    db = SessionLocal(bind=get_engine())
    try:
        yield db
    finally:
        db.close()
