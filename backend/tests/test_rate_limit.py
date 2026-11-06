from app.core.config import settings
from app.core.rate_limit import RateLimiter, login_limiter

USUARIO = {"nome": "Ana Souza", "email": "ana@exemplo.com", "senha": "senhaforte123"}


class Relogio:
    """Relógio falso: o teste controla o tempo, sem dormir de verdade."""

    def __init__(self):
        self.agora = 1000.0

    def __call__(self):
        return self.agora


# ---------------------------------------------------------------- unidade

def test_libera_ate_o_maximo_e_bloqueia_depois():
    rl = RateLimiter(max_attempts=3, window_seconds=60, clock=Relogio())
    for _ in range(3):
        assert rl.retry_after("k") == 0
        rl.register_failure("k")
    assert rl.retry_after("k") > 0


def test_libera_de_novo_depois_da_janela():
    relogio = Relogio()
    rl = RateLimiter(max_attempts=2, window_seconds=60, clock=relogio)
    rl.register_failure("k")
    rl.register_failure("k")
    assert rl.retry_after("k") > 0

    relogio.agora += 61
    assert rl.retry_after("k") == 0


def test_chaves_diferentes_nao_se_misturam():
    rl = RateLimiter(max_attempts=1, window_seconds=60, clock=Relogio())
    rl.register_failure("a")
    assert rl.retry_after("a") > 0
    assert rl.retry_after("b") == 0


def test_reset_zera_a_contagem():
    rl = RateLimiter(max_attempts=1, window_seconds=60, clock=Relogio())
    rl.register_failure("k")
    rl.reset("k")
    assert rl.retry_after("k") == 0


# ---------------------------------------------------------------- na API

def _login(client, senha):
    return client.post("/auth/login", json={"email": USUARIO["email"], "senha": senha})


def test_login_bloqueia_com_429_apos_muitas_falhas(client):
    client.post("/auth/register", json=USUARIO)

    for _ in range(settings.login_max_attempts):
        assert _login(client, "errada123").status_code == 401

    r = _login(client, "errada123")
    assert r.status_code == 429
    assert int(r.headers["retry-after"]) > 0


def test_bloqueado_nem_com_a_senha_certa(client):
    client.post("/auth/register", json=USUARIO)
    for _ in range(settings.login_max_attempts):
        _login(client, "errada123")

    assert _login(client, USUARIO["senha"]).status_code == 429


def test_login_com_sucesso_zera_as_falhas(client):
    client.post("/auth/register", json=USUARIO)
    for _ in range(settings.login_max_attempts - 1):
        _login(client, "errada123")

    assert _login(client, USUARIO["senha"]).status_code == 200
    # contagem zerada: dá para errar de novo sem tomar 429 de imediato
    assert _login(client, "errada123").status_code == 401


def test_bloqueio_de_um_email_nao_afeta_outro(client):
    for _ in range(settings.login_max_attempts):
        client.post("/auth/login", json={"email": "a@exemplo.com", "senha": "x12345678"})

    r = client.post("/auth/login", json={"email": "b@exemplo.com", "senha": "x12345678"})
    assert r.status_code == 401  # e não 429


def test_limiter_global_comeca_vazio_a_cada_teste():
    assert login_limiter.retry_after("qualquer") == 0
