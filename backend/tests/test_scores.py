from app.models import Score, User


def criar_usuario(client, nome, email="x@exemplo.com", senha="senhaforte123"):
    """Cadastra, loga e devolve (id, headers com o Bearer)."""
    user = client.post("/auth/register", json={"nome": nome, "email": email, "senha": senha}).json()
    tokens = client.post("/auth/login", json={"email": email, "senha": senha}).json()
    return user["id"], {"Authorization": f"Bearer {tokens['access_token']}"}


# ---------------------------------------------------------------- exige login

def test_todas_as_rotas_exigem_token(client):
    assert client.post("/scores", json={"pontos": 10}).status_code == 401
    assert client.get("/scores/top").status_code == 401
    assert client.get("/scores/me").status_code == 401


def test_refresh_token_nao_abre_as_rotas_de_pontuacao(client):
    client.post("/auth/register", json={"nome": "Ana", "email": "a@exemplo.com", "senha": "senhaforte123"})
    tokens = client.post("/auth/login", json={"email": "a@exemplo.com", "senha": "senhaforte123"}).json()
    r = client.get("/scores/me", headers={"Authorization": f"Bearer {tokens['refresh_token']}"})
    assert r.status_code == 401


# ---------------------------------------------------------------- salvar

def test_salva_pontuacao_para_o_usuario_do_token(client, db):
    user_id, h = criar_usuario(client, "Ana", "ana@exemplo.com")

    r = client.post("/scores", json={"pontos": 120}, headers=h)

    assert r.status_code == 201
    assert r.json()["pontos"] == 120
    assert db.query(Score).one().user_id == user_id


def test_user_id_no_corpo_e_ignorado(client, db):
    """Quem decide o dono é o token, não o que vem no corpo."""
    ana_id, h_ana = criar_usuario(client, "Ana", "ana@exemplo.com")
    bia_id, _ = criar_usuario(client, "Bia", "bia@exemplo.com")

    client.post("/scores", json={"pontos": 50, "user_id": bia_id}, headers=h_ana)

    assert db.query(Score).one().user_id == ana_id


def test_pontos_invalidos_devolvem_422(client):
    _, h = criar_usuario(client, "Ana", "ana@exemplo.com")
    assert client.post("/scores", json={"pontos": -1}, headers=h).status_code == 422
    assert client.post("/scores", json={"pontos": 999_999_999}, headers=h).status_code == 422
    assert client.post("/scores", json={"pontos": "muitos"}, headers=h).status_code == 422
    assert client.post("/scores", json={}, headers=h).status_code == 422


def test_zero_pontos_e_aceito(client):
    _, h = criar_usuario(client, "Ana", "ana@exemplo.com")
    assert client.post("/scores", json={"pontos": 0}, headers=h).status_code == 201


# ---------------------------------------------------------------- meu recorde

def test_me_sem_partidas_devolve_zeros(client):
    _, h = criar_usuario(client, "Ana", "ana@exemplo.com")
    assert client.get("/scores/me", headers=h).json() == {"recorde": 0, "partidas": 0}


def test_me_devolve_recorde_e_numero_de_partidas(client):
    _, h = criar_usuario(client, "Ana", "ana@exemplo.com")
    for pontos in (30, 200, 80):
        client.post("/scores", json={"pontos": pontos}, headers=h)

    assert client.get("/scores/me", headers=h).json() == {"recorde": 200, "partidas": 3}


def test_me_conta_so_as_partidas_do_proprio_usuario(client):
    _, h_ana = criar_usuario(client, "Ana", "ana@exemplo.com")
    _, h_bia = criar_usuario(client, "Bia", "bia@exemplo.com")
    client.post("/scores", json={"pontos": 500}, headers=h_bia)

    assert client.get("/scores/me", headers=h_ana).json() == {"recorde": 0, "partidas": 0}


# ---------------------------------------------------------------- ranking

def test_ranking_vazio(client):
    _, h = criar_usuario(client, "Ana", "ana@exemplo.com")
    assert client.get("/scores/top", headers=h).json() == []


def test_ranking_ordena_do_maior_para_o_menor_com_posicao(client):
    _, h_ana = criar_usuario(client, "Ana", "ana@exemplo.com")
    _, h_bia = criar_usuario(client, "Bia", "bia@exemplo.com")
    _, h_cadu = criar_usuario(client, "Cadu", "cadu@exemplo.com")
    client.post("/scores", json={"pontos": 100}, headers=h_ana)
    client.post("/scores", json={"pontos": 300}, headers=h_bia)
    client.post("/scores", json={"pontos": 200}, headers=h_cadu)

    ranking = client.get("/scores/top", headers=h_ana).json()

    assert ranking == [
        {"posicao": 1, "nome": "Bia", "pontos": 300, "voce": False},
        {"posicao": 2, "nome": "Cadu", "pontos": 200, "voce": False},
        {"posicao": 3, "nome": "Ana", "pontos": 100, "voce": True},  # quem pediu foi a Ana
    ]


def test_ranking_mostra_so_o_melhor_resultado_de_cada_jogador(client):
    _, h_ana = criar_usuario(client, "Ana", "ana@exemplo.com")
    _, h_bia = criar_usuario(client, "Bia", "bia@exemplo.com")
    for pontos in (10, 400, 50):
        client.post("/scores", json={"pontos": pontos}, headers=h_ana)
    client.post("/scores", json={"pontos": 100}, headers=h_bia)

    ranking = client.get("/scores/top", headers=h_ana).json()

    assert [(r["nome"], r["pontos"]) for r in ranking] == [("Ana", 400), ("Bia", 100)]


def test_ranking_nao_vaza_email(client):
    _, h = criar_usuario(client, "Ana", "ana@exemplo.com")
    client.post("/scores", json={"pontos": 10}, headers=h)

    item = client.get("/scores/top", headers=h).json()[0]

    assert set(item) == {"posicao", "nome", "pontos", "voce"}
    assert "exemplo.com" not in str(item)


def test_ranking_limita_a_dez(client, db):
    _, h = criar_usuario(client, "Ana", "ana@exemplo.com")
    for i in range(12):
        u = User(nome=f"Jogador {i:02d}", email=f"j{i}@exemplo.com", senha_hash="x")
        db.add(u)
        db.flush()
        db.add(Score(user_id=u.id, pontos=100 + i))
    db.commit()

    ranking = client.get("/scores/top", headers=h).json()

    assert len(ranking) == 10
    assert ranking[0]["pontos"] == 111
    assert ranking[-1]["posicao"] == 10


# ---------------------------------------------------------------- relação com o usuário

def test_apagar_usuario_apaga_as_pontuacoes_dele(client, db):
    user_id, h = criar_usuario(client, "Ana", "ana@exemplo.com")
    client.post("/scores", json={"pontos": 10}, headers=h)

    db.delete(db.get(User, user_id))
    db.commit()

    assert db.query(Score).count() == 0
