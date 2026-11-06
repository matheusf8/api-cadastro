"""Rotas de saúde: servem para checar se a API (e o banco) estão de pé."""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.deps import get_db

router = APIRouter(tags=["saúde"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/health/db")
def health_db(db: Session = Depends(get_db)) -> dict[str, str]:
    """Faz um `SELECT 1` só para provar que a conexão com o banco funciona."""
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "conectado"}
