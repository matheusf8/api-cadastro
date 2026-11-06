from datetime import timedelta

import jwt
import pytest

from app.core.config import settings
from app.core.security import create_access_token, create_token, decode_token

USUARIO = {"nome": "Ana Souza", "email": "ana@exemplo.com", "senha": "senhaforte123"}


@pytest.fixture()
def logado(client):
    """Cadastra, loga e devolve (id, tokens)."""
    user = client.post("/auth/register", json=USUARIO).json()
    r = client.post("/auth/login", json={"email": USUARIO["email"], "senha": USUARIO["senha"]})
    return user["id"], r.json()


def _bearer(token):
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------- tokens (unidade)

def test_token_tem_tres_partes_e_claims_certos():
    token = create_access_token(7)
    assert token.count(".") == 2  # header.payload.signature

    # Lendo SEM verificar assinatura: prova que o payload é público.
    claims = jwt.decode(token, options={"verify_signature": False})
    assert claims["sub"] == "7"
    assert claims["type"] == "access"
    assert "exp" in claims and "iat" in claims
    assert "senha" not in claims


def test_decode_devolve_id_do_usuario():
    assert decode_token(create_access_token(7), "access") == 7


def test_decode_rejeita_tipo_errado():
    with pytest.raises(ValueError):
        decode_token(create_access_token(7), "refresh")


def test_decode_rejeita_token_expirado():
    token = create_token(7, "access", timedelta(seconds=-1))
    with pytest.raises(jwt.ExpiredSignatureError):
        decode_token(token, "access")


def test_decode_rejeita_assinatura_de_outra_chave():
    falso = jwt.encode({"sub": "7", "type": "access", "exp": 9999999999}, "outra-chave", "HS256")
    with pytest.raises(jwt.InvalidSignatureError):
        decode_token(falso, "access")


def test_decode_rejeita_alg_none():
    sem_assinatura = jwt.encode({"sub": "7", "type": "access", "exp": 9999999999}, None, "none")
    with pytest.raises(jwt.PyJWTError):
        decode_token(sem_assinatura, "access")


# ---------------------------------------------------------------- login

def test_login_ok_devolve_dois_tokens(logado):
    _, tokens = logado
    assert tokens["token_type"] == "bearer"
    assert tokens["access_token"] and tokens["refresh_token"]
    assert tokens["access_token"] != tokens["refresh_token"]


def test_login_senha_errada_devolve_401(client, logado):
    r = client.post("/auth/login", json={"email": USUARIO["email"], "senha": "errada123"})
    assert r.status_code == 401


def test_login_mensagem_igual_para_email_inexistente_e_senha_errada(client, logado):
    senha_errada = client.post("/auth/login", json={"email": USUARIO["email"], "senha": "errada123"})
    sem_email = client.post("/auth/login", json={"email": "nao@existe.com", "senha": "qualquer123"})

    assert senha_errada.status_code == sem_email.status_code == 401
    assert senha_errada.json() == sem_email.json()


def test_login_ignora_maiusculas_no_email(client, logado):
    r = client.post("/auth/login", json={"email": "ANA@Exemplo.com", "senha": USUARIO["senha"]})
    assert r.status_code == 200


# ---------------------------------------------------------------- rota protegida

def test_me_sem_token_devolve_401(client):
    r = client.get("/users/me")
    assert r.status_code == 401
    assert r.headers["www-authenticate"] == "Bearer"


def test_me_com_token_valido_devolve_usuario(client, logado):
    user_id, tokens = logado
    r = client.get("/users/me", headers=_bearer(tokens["access_token"]))

    assert r.status_code == 200
    assert r.json()["id"] == user_id
    assert r.json()["email"] == USUARIO["email"]
    assert "senha_hash" not in r.json()


def test_me_com_token_expirado_devolve_401(client, logado):
    user_id, _ = logado
    expirado = create_token(user_id, "access", timedelta(seconds=-1))
    assert client.get("/users/me", headers=_bearer(expirado)).status_code == 401


def test_me_com_token_adulterado_devolve_401(client, logado):
    _, tokens = logado
    adulterado = tokens["access_token"][:-3] + "abc"
    assert client.get("/users/me", headers=_bearer(adulterado)).status_code == 401


def test_me_com_lixo_no_lugar_do_token_devolve_401(client):
    assert client.get("/users/me", headers=_bearer("isso.nao.e-jwt")).status_code == 401


def test_me_nao_aceita_refresh_token(client, logado):
    _, tokens = logado
    r = client.get("/users/me", headers=_bearer(tokens["refresh_token"]))
    assert r.status_code == 401


def test_me_com_usuario_apagado_devolve_401(client, db, logado):
    from app.models import User

    user_id, tokens = logado
    db.delete(db.get(User, user_id))
    db.commit()
    assert client.get("/users/me", headers=_bearer(tokens["access_token"])).status_code == 401


# ---------------------------------------------------------------- refresh

def test_refresh_devolve_novo_access_que_funciona(client, logado):
    _, tokens = logado
    r = client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})

    assert r.status_code == 200
    novo = r.json()["access_token"]
    assert client.get("/users/me", headers=_bearer(novo)).status_code == 200


def test_refresh_nao_aceita_access_token(client, logado):
    _, tokens = logado
    r = client.post("/auth/refresh", json={"refresh_token": tokens["access_token"]})
    assert r.status_code == 401


def test_refresh_expirado_devolve_401(client, logado):
    user_id, _ = logado
    expirado = create_token(user_id, "refresh", timedelta(seconds=-1))
    assert client.post("/auth/refresh", json={"refresh_token": expirado}).status_code == 401


def test_refresh_assinado_com_outra_chave_devolve_401(client, logado):
    user_id, _ = logado
    falso = jwt.encode(
        {"sub": str(user_id), "type": "refresh", "exp": 9999999999}, "outra-chave", settings.algorithm
    )
    assert client.post("/auth/refresh", json={"refresh_token": falso}).status_code == 401
