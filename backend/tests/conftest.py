"""Fixtures compartilhadas: cada teste ganha um banco SQLite novo, em memória."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import models  # noqa: F401
from app.core.config import settings
from app.core.rate_limit import login_limiter
from app.database import Base
from app.deps import get_db
from app.main import app


@pytest.fixture(autouse=True)
def _zera_limite_de_login():
    """O limiter vive em memória; sem isso, falhas de um teste vazam para o outro."""
    login_limiter.clear()
    yield
    login_limiter.clear()


@pytest.fixture(autouse=True)
def _cadastro_livre(monkeypatch):
    """Os testes não dependem do .env real: por padrão, sem convite e sem teto."""
    monkeypatch.setattr(settings, "invite_code", "")
    monkeypatch.setattr(settings, "max_users", 0)


@pytest.fixture()
def db():
    # StaticPool: todas as conexões enxergam o MESMO banco em memória.
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture()
def client(db):
    # Troca o get_db real pelo banco de teste (dependency override).
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
