"""Conexão com o banco (SQLAlchemy).

- `engine`: a "ligação" com o banco.
- `SessionLocal`: fábrica de sessões (uma sessão = uma conversa com o banco).
- `Base`: classe-mãe de todos os models (tabelas).
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings



def normalizar_url(url: str) -> str:
    """Aponta URLs de Postgres para o driver psycopg (v3).

    Serviços como o Neon entregam `postgresql://...` (ou `postgres://...`). Sem dizer
    o driver, o SQLAlchemy procuraria o psycopg2, que não está instalado.
    """
    for prefixo in ("postgres://", "postgresql://"):
        if url.startswith(prefixo):
            return "postgresql+psycopg://" + url[len(prefixo):]
    return url


DATABASE_URL = normalizar_url(settings.database_url)

# O SQLite, por padrão, só aceita uso na thread que criou a conexão.
# O FastAPI atende requisições em várias threads, então liberamos isso.
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# pool_pre_ping: testa a conexão antes de usar. O banco na nuvem "dorme" quando fica
# sem uso e derruba conexões antigas; sem isso, a primeira requisição daria erro.
engine = create_engine(DATABASE_URL, connect_args=_connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """Todos os models herdam daqui; o SQLAlchemy usa isso para criar as tabelas."""
