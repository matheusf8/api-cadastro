from app.core.security import hash_password, verify_password


def test_hash_nao_e_a_senha_pura():
    assert hash_password("minhasenha123") != "minhasenha123"


def test_verifica_senha_correta_e_errada():
    h = hash_password("minhasenha123")
    assert verify_password("minhasenha123", h) is True
    assert verify_password("outrasenha", h) is False


def test_mesma_senha_gera_hashes_diferentes_por_causa_do_sal():
    assert hash_password("minhasenha123") != hash_password("minhasenha123")
