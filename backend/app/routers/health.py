"""Rota de saúde: serve para checar se a API está de pé."""

from fastapi import APIRouter

router = APIRouter(tags=["saúde"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
