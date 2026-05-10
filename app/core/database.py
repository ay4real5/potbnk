import logging
from threading import Lock
from functools import lru_cache

from fastapi import HTTPException
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.engine import make_url
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
        host = make_url(database_url).host or ""
        local_hosts = {"localhost", "127.0.0.1", "db"}
        sslmode = "disable" if host in local_hosts else "require"
        separator = "&" if "?" in database_url else "?"
        database_url = f"{database_url}{separator}sslmode={sslmode}"
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
        engine = get_engine()
        Base.metadata.create_all(bind=engine)
        _apply_lightweight_migrations(engine)
        _schema_ready = True
        logger.info("Database schema check completed.")


_LIGHTWEIGHT_MIGRATIONS = [
    "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'POSTED'",
    "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(80)",
    "CREATE UNIQUE INDEX IF NOT EXISTS ix_transactions_idempotency_key ON transactions (idempotency_key)",
    "CREATE INDEX IF NOT EXISTS ix_transactions_status ON transactions (status)",
]


def _apply_lightweight_migrations(engine):
    try:
        with engine.begin() as connection:
            for sql in _LIGHTWEIGHT_MIGRATIONS:
                connection.execute(text(sql))
    except SQLAlchemyError:
        logger.exception("Lightweight migration failed; continuing with existing schema.")


def get_db():
    try:
        ensure_schema()
        db = SessionLocal(bind=get_engine())
    except SQLAlchemyError as exc:
        logger.exception("Database connection failed.")
        raise HTTPException(status_code=503, detail=f"Database connection failed: {exc.__class__.__name__}") from exc
    try:
        yield db
    finally:
        db.close()
