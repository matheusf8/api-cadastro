from app.core.config import settings

PREFLIGHT = {
    "Access-Control-Request-Method": "POST",
    "Access-Control-Request-Headers": "authorization,content-type",
}


def test_origem_do_front_e_liberada(client):
    r = client.options("/auth/login", headers={"Origin": settings.frontend_origin, **PREFLIGHT})

    assert r.status_code == 200
    assert r.headers["access-control-allow-origin"] == settings.frontend_origin


def test_origem_desconhecida_nao_e_liberada(client):
    r = client.options("/auth/login", headers={"Origin": "http://site-malicioso.com", **PREFLIGHT})

    assert "access-control-allow-origin" not in r.headers


def test_metodo_nao_usado_pelo_front_e_recusado_no_preflight(client):
    r = client.options(
        "/scores",
        headers={"Origin": settings.frontend_origin, "Access-Control-Request-Method": "DELETE"},
    )
    assert r.status_code == 400  # "Disallowed CORS method"


def test_cabecalho_nao_usado_pelo_front_e_recusado_no_preflight(client):
    r = client.options(
        "/scores",
        headers={
            "Origin": settings.frontend_origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "x-qualquer-coisa",
        },
    )
    assert r.status_code == 400


def test_nao_libera_credenciais(client):
    r = client.get("/health", headers={"Origin": settings.frontend_origin})
    assert "access-control-allow-credentials" not in r.headers


def test_resposta_normal_tambem_traz_o_header_para_a_origem_certa(client):
    r = client.get("/health", headers={"Origin": settings.frontend_origin})
    assert r.headers["access-control-allow-origin"] == settings.frontend_origin
