# Etapa 1 — Backend base + banco

**Objetivo:** conectar a API a um banco SQLite, definir a tabela de usuários e preparar a sessão por requisição.
**Resultado:** `app.db` criado ao subir a API, tabela `users` pronta, `GET /health/db` responde, 5 testes passando.

## Conceitos novos
| Conceito | Analogia |
|---|---|
| **Engine** | o cabo ligando o programa ao banco |
| **Session** | uma conversa com o banco: abre, faz perguntas, fecha |
| **Model** | a planta da tabela escrita em Python |
| **Injeção de dependência (`Depends`)** | o FastAPI entrega pronto o que a rota precisa (ex.: a sessão) |
| **Unique + index** | o banco recusa e-mail repetido e acha o e-mail rápido |

## Passo a passo (o que foi feito e como)

### 1. `app/database.py` — conexão
- `create_engine(settings.database_url, ...)`: lê a URL do `.env` (`sqlite:///./app.db`).
- `connect_args={"check_same_thread": False}` só para SQLite: o FastAPI atende em várias threads e o SQLite, por padrão, proíbe isso.
- `SessionLocal = sessionmaker(...)`: fábrica de sessões. `expire_on_commit=False` evita recarregar o objeto do banco a cada commit.
- `class Base(DeclarativeBase)`: classe-mãe de todos os models.

### 2. `app/models.py` — tabela `users`
| Coluna | Tipo | Regra |
|---|---|---|
| `id` | int | chave primária |
| `nome` | texto(80) | obrigatório |
| `email` | texto(254) | **único** e **indexado** |
| `senha_hash` | texto(255) | só o hash, nunca a senha |
| `criado_em` | data/hora com fuso | preenchida automaticamente em UTC |

Usei o estilo moderno do SQLAlchemy 2 (`Mapped[...]` + `mapped_column`), que dá tipagem e autocompletar.

### 3. `app/deps.py` — `get_db`
Função geradora (`yield`): abre uma sessão, entrega para a rota e **sempre** fecha no `finally`, mesmo se a rota der erro. As rotas usam `db: Session = Depends(get_db)`.

### 4. `app/main.py` — criar tabelas ao subir
Um `lifespan` roda `Base.metadata.create_all(engine)` na inicialização: cria as tabelas que ainda não existem. O `from app import models` é necessário: sem importar, o `Base` não "sabe" que as tabelas existem.
> Limitação consciente: `create_all` não altera tabelas já criadas. Em produção se usa **Alembic** (migrações).

### 5. `GET /health/db`
Roda `SELECT 1` pela sessão injetada. Se responder, a conexão com o banco está viva.

### 6. Testes com banco isolado (`tests/conftest.py`)
- Fixture `db`: SQLite **em memória** (`sqlite://` + `StaticPool` para todas as conexões verem o mesmo banco). Cada teste começa limpo.
- Fixture `client`: troca o `get_db` real pelo de teste via `app.dependency_overrides`. Os testes nunca tocam o `app.db` real.
- `test_models.py`: salva usuário (id e data preenchidos), busca por e-mail, e-mail duplicado levanta `IntegrityError`.
- `test_health.py`: agora também testa `/health/db`.

### 7. Verificação
| Checagem | Resultado |
|---|---|
| `pytest` | 5 passaram |
| Subir `uvicorn` e `curl /health/db` | `{"status":"ok","database":"conectado"}` |
| Inspecionar `app.db` com `sqlite3` | tabela `users` com as 5 colunas |

## Próximo passo
Etapa 2: cadastro (`POST /auth/register`) com schemas Pydantic e hash de senha.
