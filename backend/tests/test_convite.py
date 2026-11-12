"""Cadastro restrito: código de convite e teto de contas (usados no deploy)."""

from app.core.config import settings
from app.database import normalizar_url

CODIGO = "familia-2026"


def _dados(n=1, **extra):
    return {"nome": f"Pessoa {n}", "email": f"p{n}@exemplo.com", "senha": "senhaforte123", **extra}


def test_sem_convite_configurado_cadastro_e_livre(client):
    assert client.post("/auth/register", json=_dados()).status_code == 201


def test_convite_certo_cria_conta(client, monkeypatch):
    monkeypatch.setattr(settings, "invite_code", CODIGO)

    r = client.post("/auth/register", json=_dados(codigo_convite=CODIGO))

    assert r.status_code == 201
    assert "codigo_convite" not in r.json()  # o código nunca volta na resposta


def test_convite_com_espacos_em_volta_e_aceito(client, monkeypatch):
    monkeypatch.setattr(settings, "invite_code", CODIGO)

    r = client.post("/auth/register", json=_dados(codigo_convite=f"  {CODIGO} "))

    assert r.status_code == 201


def test_convite_errado_devolve_403(client, monkeypatch):
    monkeypatch.setattr(settings, "invite_code", CODIGO)

    r = client.post("/auth/register", json=_dados(codigo_convite="chute"))

    assert r.status_code == 403
    assert r.json()["detail"] == "Código de convite inválido"


def test_convite_ausente_devolve_403(client, monkeypatch):
    monkeypatch.setattr(settings, "invite_code", CODIGO)

    assert client.post("/auth/register", json=_dados()).status_code == 403


def test_convite_errado_nao_cria_usuario(client, db, monkeypatch):
    from app.models import User

    monkeypatch.setattr(settings, "invite_code", CODIGO)
    client.post("/auth/register", json=_dados(codigo_convite="chute"))

    assert db.query(User).count() == 0


def test_limite_de_contas_recusa_a_proxima(client, monkeypatch):
    monkeypatch.setattr(settings, "max_users", 2)

    assert client.post("/auth/register", json=_dados(1)).status_code == 201
    assert client.post("/auth/register", json=_dados(2)).status_code == 201
    r = client.post("/auth/register", json=_dados(3))

    assert r.status_code == 403
    assert "Limite de contas" in r.json()["detail"]


def test_limite_nao_impede_login_de_quem_ja_tem_conta(client, monkeypatch):
    monkeypatch.setattr(settings, "max_users", 1)
    client.post("/auth/register", json=_dados(1))

    r = client.post("/auth/login", json={"email": "p1@exemplo.com", "senha": "senhaforte123"})

    assert r.status_code == 200


def test_url_do_postgres_usa_o_driver_psycopg():
    assert normalizar_url("postgresql://u:s@host/db") == "postgresql+psycopg://u:s@host/db"
    assert normalizar_url("postgres://u:s@host/db") == "postgresql+psycopg://u:s@host/db"


def test_url_do_sqlite_nao_muda():
    assert normalizar_url("sqlite:///./app.db") == "sqlite:///./app.db"
