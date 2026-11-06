"""Schemas = contrato da API (o que entra e o que sai). Não são as tabelas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    """Corpo esperado em POST /auth/register."""

    nome: str = Field(min_length=2, max_length=80)
    email: EmailStr
    # max 128: evita enviar uma "senha" gigante só para gastar CPU no hash.
    senha: str = Field(min_length=8, max_length=128)

    @field_validator("nome")
    @classmethod
    def _limpa_nome(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Nome muito curto")
        return v

    @field_validator("email")
    @classmethod
    def _email_minusculo(cls, v: str) -> str:
        # "Ana@X.com" e "ana@x.com" devem ser o mesmo usuário.
        return v.lower()


class LoginRequest(BaseModel):
    """Corpo de POST /auth/login. Sem regras de tamanho: quem erra só recebe 401."""

    email: EmailStr
    senha: str = Field(max_length=128)

    @field_validator("email")
    @classmethod
    def _email_minusculo(cls, v: str) -> str:
        return v.lower()


class TokenPair(BaseModel):
    """Resposta do login."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class AccessToken(BaseModel):
    """Resposta do refresh: só um novo access."""

    access_token: str
    token_type: str = "bearer"


class UserPublic(BaseModel):
    """O que a API devolve sobre um usuário. Repare: NÃO há campo de senha."""

    model_config = ConfigDict(from_attributes=True)  # permite criar a partir do model

    id: int
    nome: str
    email: EmailStr
    criado_em: datetime
