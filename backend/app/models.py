"""Models = tabelas do banco. (Não confundir com schemas, que são o contrato da API.)"""

from datetime import datetime, timezone

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _agora() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(80))
    # unique=True: o próprio banco impede dois cadastros com o mesmo e-mail.
    # index=True: acelera a busca por e-mail, que acontece em todo login.
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    # Guardamos só o HASH da senha, nunca a senha.
    senha_hash: Mapped[str] = mapped_column(String(255))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_agora)

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r}>"
