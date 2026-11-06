"""Rotas de autenticação. Nesta etapa: cadastro. (Login e refresh na Etapa 3.)"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.deps import get_db
from app.models import User
from app.schemas import UserCreate, UserPublic

router = APIRouter(prefix="/auth", tags=["autenticação"])

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
