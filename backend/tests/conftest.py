"""Shared fixtures for the Sakapuss backend test suite."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.db.base import Base
from backend.app.db.session import get_db
from backend.main import app


@pytest.fixture()
def db_engine():
    """Create an in-memory SQLite engine for testing."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    # Import all models so Base.metadata is fully populated
    import backend.app.modules.health.models
    import backend.app.modules.pets.models
    import backend.app.modules.users.models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture()
def db_session(db_engine):
    """Provide a transactional database session for each test."""
    TestingSession = sessionmaker(bind=db_engine, class_=Session, autoflush=False, expire_on_commit=False)
    session = TestingSession()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture()
def client(db_session):
    """FastAPI TestClient wired to the in-memory test database."""

    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    # Override both get_db references (session module and reminders/pets local)
    app.dependency_overrides[get_db] = _override_get_db

    # Also override the local get_db used in reminders and pets routers
    from backend.app.api import pets as pets_mod
    from backend.app.api import reminders as reminders_mod

    app.dependency_overrides[pets_mod.get_db] = _override_get_db
    app.dependency_overrides[reminders_mod.get_db] = _override_get_db

    with TestClient(app, raise_server_exceptions=False) as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture()
def auth_header(client):
    """Register a test user and return an Authorization header dict."""
    resp = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "StrongP@ss1",
            "display_name": "Test User",
            "language": "en",
        },
    )
    assert resp.status_code == 201, f"Registration failed: {resp.text}"
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def test_pet(client, auth_header):
    """Create and return a test pet dict."""
    resp = client.post(
        "/pets",
        json={
            "name": "Minou",
            "species": "Cat",
            "birth_date": "2020-06-15",
        },
    )
    assert resp.status_code == 201, f"Pet creation failed: {resp.text}"
    return resp.json()
