"""Segurança: hash de senha (e, na Etapa 3, criação/leitura de tokens JWT).

Hash NÃO é criptografia: não existe "descriptografar". Só dá para conferir se uma
senha digitada gera o mesmo hash. Analogia: triturador de papel.
"""

from pwdlib import PasswordHash

# `recommended()` usa argon2, o algoritmo recomendado hoje. Cada hash já embute
# um "sal" aleatório, então a mesma senha gera hashes diferentes.
_password_hash = PasswordHash.recommended()


def hash_password(senha: str) -> str:
    return _password_hash.hash(senha)


def verify_password(senha: str, senha_hash: str) -> bool:
    return _password_hash.verify(senha, senha_hash)
