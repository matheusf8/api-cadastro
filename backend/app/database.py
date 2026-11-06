"""Conexão com o banco (SQLAlchemy).

- `engine`: a "ligação" com o banco.
- `SessionLocal`: fábrica de sessões (uma sessão = uma conversa com o banco).
- `Base`: classe-mãe de todos os models (tabelas).
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

# O SQLite, por padrão, só aceita uso na thread que criou a conexão.
# O FastAPI atende requisições em várias threads, então liberamos isso.
_connect_args = (
    {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
)

engine = create_engine(settings.database_url, connect_args=_connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """Todos os models herdam daqui; o SQLAlchemy usa isso para criar as tabelas."""
