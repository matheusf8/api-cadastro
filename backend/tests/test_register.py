import pytest

from app.core.security import verify_password
from app.models import User

VALIDO = {"nome": "Ana Souza", "email": "ana@exemplo.com", "senha": "senhaforte123"}


def test_cadastro_ok_devolve_201_sem_senha(client):
    r = client.post("/auth/register", json=VALIDO)

    assert r.status_code == 201
    corpo = r.json()
    assert corpo["email"] == "ana@exemplo.com"
    assert corpo["nome"] == "Ana Souza"
    assert "id" in corpo and "criado_em" in corpo
    # a resposta nunca pode vazar senha nem hash
    assert "senha" not in corpo and "senha_hash" not in corpo


def test_senha_e_salva_como_hash(client, db):
    client.post("/auth/register", json=VALIDO)

    user = db.query(User).filter_by(email="ana@exemplo.com").one()
    assert user.senha_hash != VALIDO["senha"]
    assert verify_password(VALIDO["senha"], user.senha_hash)


def test_email_duplicado_devolve_409(client):
    client.post("/auth/register", json=VALIDO)
    r = client.post("/auth/register", json=VALIDO)

    assert r.status_code == 409
    assert r.json()["detail"] == "E-mail já cadastrado"


def test_email_e_normalizado_para_minusculo(client):
    client.post("/auth/register", json=VALIDO)
    r = client.post("/auth/register", json={**VALIDO, "email": "ANA@Exemplo.com"})

    assert r.status_code == 409


@pytest.mark.parametrize(
    "campo,valor",
    [
        ("email", "isso-nao-e-email"),
        ("senha", "curta"),
        ("senha", "x" * 129),
        ("nome", " "),
        ("nome", "A"),
    ],
)
def test_dados_invalidos_devolvem_422(client, campo, valor):
    r = client.post("/auth/register", json={**VALIDO, campo: valor})
    assert r.status_code == 422


def test_campo_obrigatorio_ausente_devolve_422(client):
    r = client.post("/auth/register", json={"email": "ana@exemplo.com"})
    assert r.status_code == 422
