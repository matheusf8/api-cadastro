"""Rotas do usuário logado."""

from fastapi import APIRouter, Depends

from app.deps import get_current_user
from app.models import User
from app.schemas import UserPublic

router = APIRouter(prefix="/users", tags=["usuários"])


@router.get("/me", response_model=UserPublic)
def me(user: User = Depends(get_current_user)) -> User:
    """Rota protegida: só entra quem passa pela catraca `get_current_user`."""
    return user
