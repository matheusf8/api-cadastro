# Arquitetura

## Visão geral

```
┌──────────────┐   HTTP + JSON    ┌────────────────────────────┐   SQL   ┌────────┐
│ React (Vite) │ ───────────────▶ │ FastAPI                    │ ──────▶ │ SQLite │
│ :5173        │ ◀─────────────── │ :8000                      │         │ app.db │
└──────────────┘  Bearer <JWT>    └────────────────────────────┘         └────────┘
```

Duas aplicações independentes que só se falam por HTTP. O front não conhece o banco; o back não conhece o React.

## Backend: camadas

Cada camada tem uma responsabilidade e só "olha para baixo":

| Camada | Arquivo(s) | Responsabilidade |
|---|---|---|
| Rotas | `routers/*.py` | Receber a requisição, chamar a lógica, devolver a resposta e o status code. Sem regra de negócio pesada. |
| Schemas | `schemas.py` | Formato dos dados que entram e saem (Pydantic). Valida e **esconde** campos (ex.: senha). |
| Dependências | `deps.py` | `get_db` (sessão) e `get_current_user` (valida o JWT). Injetadas com `Depends`. |
| Segurança | `core/security.py` | Hash/verificação de senha e criação/leitura de tokens. |
| Modelos | `models.py` | Tabelas do banco (SQLAlchemy). |
| Banco | `database.py` | Engine e sessão. |
| Config | `core/config.py` | Lê o `.env`. Único lugar com segredos e prazos. |

Regra de ouro: **schema ≠ model**. O model é a tabela; o schema é o contrato da API. Por isso a senha nunca vaza na resposta.

## Fluxo JWT

```
Cadastro   POST /auth/register ──▶ valida ──▶ hash ──▶ salva ──▶ 201
Login      POST /auth/login    ──▶ confere hash ──▶ { access_token, refresh_token }
Uso        GET  /users/me  + "Authorization: Bearer <access>"
                                 └─▶ get_current_user: confere assinatura e exp ──▶ usuário
Renovar    POST /auth/refresh  + refresh ──▶ novo access
```

- **access token**: vida curta (15 min). Se vazar, o estrago é limitado.
- **refresh token**: vida longa (7 dias). Só serve para pedir um novo access.
- O servidor **não guarda** o access token: valida pela assinatura (stateless).
- Claims usados: `sub` (id do usuário), `exp` (expiração), `type` (`access` ou `refresh`).

## Frontend: organização

| Pasta | O que mora lá |
|---|---|
| `pages/` | Uma tela por rota (`Login`, `Cadastro`, `Jogo`). Montam componentes. |
| `components/` | Peças visuais reutilizáveis e sem conhecimento de API. |
| `api/` | `client.js` (Axios) e, depois, funções por assunto (`auth.js`, `scores.js`). |
| `auth/` | `AuthContext` (quem está logado) e `ProtectedRoute`. |
| `game/` | Lógica do jogo separada da tela: física, colisão, desenho no canvas. |
| `lib/` | Funções utilitárias sem relação com React (ex.: `cn`). |
| `index.css` | Tokens de design do Tailwind (`@theme`). |

Rotas: `/login`, `/cadastro`, `/jogo` (protegida na Etapa 7), `/status` (diagnóstico) e `*` (404).

Import absoluto: `@/` aponta para `src/` (ex.: `import { api } from '@/api/client'`).

## Convenções
- Nomes de arquivo: Python em `snake_case.py`; componentes React em `PascalCase.jsx`.
- Uma rota nova = um arquivo em `routers/` + `include_router` no `main.py`.
- Todo segredo vem do `.env`; nunca no código.
- Todo endpoint novo ganha teste em `backend/tests/`.
- Commits pequenos, um por etapa ou subtarefa (`feat:`, `fix:`, `docs:`, `test:`).
