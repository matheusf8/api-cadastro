import logging

import pytest

from app.core.config import Settings

FORTE = "k" * 64


def _settings(**kw):
    # _env_file=None: ignora o .env real, o teste controla tudo.
    return Settings(_env_file=None, **kw)


def test_chave_curta_ou_de_exemplo_e_fraca():
    assert _settings(secret_key="curta").segredo_fraco()
    assert _settings(secret_key="troque-esta-chave" + "x" * 40).segredo_fraco()
    assert _settings(secret_key="dev-only-" + "x" * 40).segredo_fraco()


def test_chave_longa_e_aleatoria_e_forte():
    assert not _settings(secret_key=FORTE).segredo_fraco()


def test_producao_com_chave_fraca_recusa_subir():
    with pytest.raises(RuntimeError):
        _settings(secret_key="curta", environment="production").validar_segredo()


def test_producao_com_chave_forte_sobe():
    _settings(secret_key=FORTE, environment="production").validar_segredo()


def test_dev_com_chave_fraca_so_avisa(caplog):
    with caplog.at_level(logging.WARNING, logger="uvicorn.error"):
        _settings(secret_key="curta", environment="dev").validar_segredo()
    assert "SECRET_KEY fraca" in caplog.text
