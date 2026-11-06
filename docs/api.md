# Contrato da API

Base: `http://localhost:8000` · Docs interativas: `/docs`

Legenda: ✅ pronto · 🕓 planejado (etapa)

| Status | Método | Rota | Auth | Descrição | Respostas |
|---|---|---|---|---|---|
| ✅ | GET | `/health` | não | Checa se a API está de pé | 200 `{"status":"ok"}` |
| 🕓 E2 | POST | `/auth/register` | não | Cria usuário | 201, 409 e-mail já existe, 422 dados inválidos |
| 🕓 E3 | POST | `/auth/login` | não | Devolve access + refresh token | 200, 401 credenciais inválidas |
| 🕓 E3 | POST | `/auth/refresh` | refresh token | Novo access token | 200, 401 |
| 🕓 E3 | GET | `/users/me` | Bearer | Dados do usuário logado | 200, 401 |
| 🕓 E9 | POST | `/scores` | Bearer | Salva pontuação do usuário logado | 201, 401 |
| 🕓 E9 | GET | `/scores/top` | Bearer | Ranking top 10 | 200, 401 |

## Convenções
- Corpo e resposta em JSON.
- Autenticação: header `Authorization: Bearer <access_token>`.
- Erros seguem o formato do FastAPI: `{"detail": "mensagem"}`.
- Mensagens de erro de login são genéricas (não revelam se o e-mail existe).
