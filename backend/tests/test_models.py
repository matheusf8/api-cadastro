import pytest
from sqlalchemy.exc import IntegrityError

from app.models import User


def _usuario(email="ana@exemplo.com"):
    return User(nome="Ana", email=email, senha_hash="hash-falso")


def test_salva_usuario_e_preenche_id_e_data(db):
    user = _usuario()
    db.add(user)
    db.commit()

    assert user.id is not None
    assert user.criado_em is not None


def test_busca_usuario_por_email(db):
    db.add(_usuario())
    db.commit()

    achado = db.query(User).filter_by(email="ana@exemplo.com").one()
    assert achado.nome == "Ana"


def test_email_duplicado_viola_unicidade(db):
    db.add(_usuario())
    db.commit()

    db.add(_usuario())
    with pytest.raises(IntegrityError):
        db.commit()
