"""Segurança: hash de senha e tokens JWT.

Hash NÃO é criptografia: não existe "descriptografar". Só dá para conferir se uma
senha digitada gera o mesmo hash. Analogia: triturador de papel.

JWT = pulseira de festa. Tem 3 partes separadas por ponto: header.payload.signature
- header:    algoritmo usado (HS256)
- payload:   os "claims" (dados). É só Base64: QUALQUER UM LÊ. Nunca ponha segredo aqui.
- signature: assinatura feita com a SECRET_KEY. Se alguém mexer no payload, não bate.
Assinar NÃO esconde o conteúdo; só garante que ninguém alterou.
"""

from datetime import datetime, timedelta, timezone
from typing import Literal

import jwt
from pwdlib import PasswordHash

from app.core.config import settings

# ---------------------------------------------------------------- senha

# `recommended()` usa argon2, o algoritmo recomendado hoje. Cada hash já embute
# um "sal" aleatório, então a mesma senha gera hashes diferentes.
_password_hash = PasswordHash.recommended()


def hash_password(senha: str) -> str:
    return _password_hash.hash(senha)


def verify_password(senha: str, senha_hash: str) -> bool:
    return _password_hash.verify(senha, senha_hash)


# Hash de mentira, usado para gastar o mesmo tempo quando o e-mail não existe
# (evita descobrir e-mails cadastrados medindo o tempo de resposta do login).
DUMMY_HASH = hash_password("senha-de-mentira-para-igualar-tempo")

# ---------------------------------------------------------------- JWT

TokenType = Literal["access", "refresh"]


def create_token(
    user_id: int,
    token_type: TokenType,
    expires_delta: timedelta | None = None,
) -> str:
    """Cria um JWT assinado.

    Claims:
      sub  = quem é o dono (id do usuário, como texto)
      type = "access" ou "refresh" (impede usar um no lugar do outro)
      iat  = emitido em
      exp  = expira em (o PyJWT confere sozinho ao decodificar)
    """
    if expires_delta is None:
        expires_delta = (
            timedelta(minutes=settings.access_token_expire_minutes)
            if token_type == "access"
            else timedelta(days=settings.refresh_token_expire_days)
        )
    agora = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "type": token_type,
        "iat": agora,
        "exp": agora + expires_delta,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def create_access_token(user_id: int) -> str:
    return create_token(user_id, "access")


def create_refresh_token(user_id: int) -> str:
    return create_token(user_id, "refresh")


def decode_token(token: str, expected_type: TokenType) -> int:
    """Valida o token e devolve o id do usuário.

    Levanta `jwt.PyJWTError` (ou `ValueError`) se for inválido, adulterado,
    expirado ou do tipo errado.
    """
    payload = jwt.decode(
        token,
        settings.secret_key,
        # Lista FIXA de algoritmos: bloqueia o ataque em que o token diz "alg: none".
        algorithms=[settings.algorithm],
        options={"require": ["exp", "sub", "type"]},
    )
    if payload["type"] != expected_type:
        raise ValueError("Tipo de token errado")
    return int(payload["sub"])
