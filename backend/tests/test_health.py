def test_health_responde_ok(client):
    resposta = client.get("/health")
    assert resposta.status_code == 200
    assert resposta.json() == {"status": "ok"}


def test_health_db_conecta_no_banco(client):
    resposta = client.get("/health/db")
    assert resposta.status_code == 200
    assert resposta.json()["database"] == "conectado"
