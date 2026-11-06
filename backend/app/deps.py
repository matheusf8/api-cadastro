"""Dependências injetadas nas rotas com `Depends(...)`."""

from collections.abc import Iterator

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.database import SessionLocal
from app.models import User


def get_db() -> Iterator[Session]:
    """Abre uma sessão por requisição e garante que ela fecha no final."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# auto_error=False: quem decide o erro somos nós (sempre 401 + WWW-Authenticate).
_bearer = HTTPBearer(auto_error=False)

_NAO_AUTENTICADO = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Não autenticado",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    credenciais: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    """A "catraca": lê o header `Authorization: Bearer <token>` e devolve o usuário.

    Qualquer problema (sem token, assinatura ruim, expirado, tipo errado, usuário
    apagado) vira o MESMO 401, para não dar pista a quem ataca.
    """
    if credenciais is None:
        raise _NAO_AUTENTICADO
    try:
        user_id = decode_token(credenciais.credentials, expected_type="access")
    except (jwt.PyJWTError, ValueError):
        raise _NAO_AUTENTICADO from None

    user = db.get(User, user_id)
    if user is None:
        raise _NAO_AUTENTICADO
    return user
