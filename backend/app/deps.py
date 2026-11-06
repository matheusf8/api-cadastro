"""Dependências injetadas nas rotas com `Depends(...)`."""

from collections.abc import Iterator

from sqlalchemy.orm import Session

from app.database import SessionLocal


def get_db() -> Iterator[Session]:
    """Abre uma sessão por requisição e garante que ela fecha no final."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
