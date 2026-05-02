"""
pytest configuration — environment variables MUST be set before any app module
is imported, because app/core/config.py (via pydantic-settings) reads them at
import time, and app/core/database.py creates the engine at import time.
"""
import os

# Override env vars before any app code is imported
os.environ.setdefault("SECRET_KEY", "ci-test-secret-key-not-for-production")
os.environ.setdefault("ADMIN_LOGIN_ENABLED", "true")
os.environ.setdefault("ADMIN_LOGIN_EMAIL", "admin@potbnk.app")
os.environ.setdefault("ADMIN_LOGIN_PASSWORD", "AdminTest#2026")
os.environ["DATABASE_URL"] = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5433/bankapp_test",
)

# Clear lru_cache so Settings picks up the test DATABASE_URL
from app.core import config as _cfg_module  # noqa: E402
_cfg_module.get_settings.cache_clear()

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.main import app
from app.api.routes import auth as auth_module

_engine = create_engine(os.environ["DATABASE_URL"])
_SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


@pytest.fixture(scope="session", autouse=True)
def create_tables():
    """Create all tables once for the test session, drop them after."""
    Base.metadata.create_all(bind=_engine)
    yield
    Base.metadata.drop_all(bind=_engine)


def _override_get_db():
    db = _SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _wipe_db():
    """Delete all rows in dependency-safe order (child → parent)."""
    with _engine.connect() as conn:
        conn.execute(text("DELETE FROM transactions"))
        conn.execute(text("DELETE FROM accounts"))
        conn.execute(text("DELETE FROM users"))
        conn.commit()


def _reset_in_memory_state():
    """Clear module-level rate-limiter and reset-token dicts between tests."""
    auth_module._login_attempts.clear()
    auth_module._reset_tokens.clear()


@pytest.fixture()
def client(create_tables):
    """Return a TestClient with DB dependency overridden; wipes data after each test."""
    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c
    app.dependency_overrides.clear()
    _wipe_db()
    _reset_in_memory_state()
