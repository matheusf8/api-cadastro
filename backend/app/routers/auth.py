"""Rotas de autenticação: cadastro, login e renovação do token."""

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import (
    DUMMY_HASH,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.deps import get_db
from app.models import User
from app.schemas import (
    AccessToken,
    LoginRequest,
    RefreshRequest,
    TokenPair,
    UserCreate,
    UserPublic,
)

router = APIRouter(prefix="/auth", tags=["autenticação"])

# Mensagem GENÉRICA: não diz se errou o e-mail ou a senha.
_CREDENCIAIS_INVALIDAS = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="E-mail ou senha inválidos",
    headers={"WWW-Authenticate": "Bearer"},
)
_REFRESH_INVALIDO = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Refresh token inválido ou expirado",
    headers={"WWW-Authenticate": "Bearer"},
)

_EMAIL_EM_USO = HTTPException(
    status_code=status.HTTP_409_CONFLICT, detail="E-mail já cadastrado"
)


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(dados: UserCreate, db: Session = Depends(get_db)) -> User:
    # 1) Checagem amigável: evita o erro na maioria dos casos.
    if db.scalar(select(User).where(User.email == dados.email)):
        raise _EMAIL_EM_USO

    user = User(
        nome=dados.nome,
        email=dados.email,
        senha_hash=hash_password(dados.senha),  # a senha pura nunca é salva
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        # 2) Rede de segurança: duas requisições simultâneas passam pela checagem 1,
        #    mas o UNIQUE do banco barra a segunda.
        db.rollback()
        raise _EMAIL_EM_USO from None
    return user


@router.post("/login", response_model=TokenPair)
def login(dados: LoginRequest, db: Session = Depends(get_db)) -> TokenPair:
    user = db.scalar(select(User).where(User.email == dados.email))

    # Sempre roda UMA verificação de senha, mesmo se o e-mail não existe, para o
    # tempo de resposta não revelar quais e-mails estão cadastrados.
    senha_ok = verify_password(dados.senha, user.senha_hash if user else DUMMY_HASH)
    if user is None or not senha_ok:
        raise _CREDENCIAIS_INVALIDAS

    return TokenPair(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=AccessToken)
def refresh(dados: RefreshRequest, db: Session = Depends(get_db)) -> AccessToken:
    """Troca um refresh token válido por um novo access token."""
    try:
        user_id = decode_token(dados.refresh_token, expected_type="refresh")
    except (jwt.PyJWTError, ValueError):
        raise _REFRESH_INVALIDO from None

    # O usuário ainda existe? (pode ter sido apagado depois do login)
    if db.get(User, user_id) is None:
        raise _REFRESH_INVALIDO
    return AccessToken(access_token=create_access_token(user_id))
