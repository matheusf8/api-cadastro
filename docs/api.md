# Contrato da API

Base: `http://localhost:8000` · Docs interativas: `/docs`

Legenda: ✅ pronto · 🕓 planejado (etapa)

| Status | Método | Rota | Auth | Descrição | Respostas |
|---|---|---|---|---|---|
| ✅ | GET | `/health` | não | Checa se a API está de pé | 200 `{"status":"ok"}` |
| ✅ | GET | `/health/db` | não | Checa a conexão com o banco | 200 `{"status":"ok","database":"conectado"}` |
| ✅ | POST | `/auth/register` | não | Cria usuário. Corpo: `{nome, email, senha, codigo_convite?}` (senha 8–128). O `codigo_convite` só é exigido quando o servidor tem `INVITE_CODE`. Resposta: `{id, nome, email, criado_em}` | 201, 403 convite inválido ou limite de contas, 409 e-mail já existe, 422 dados inválidos |
| ✅ | POST | `/auth/login` | não | Corpo `{email, senha}`. Devolve `{access_token, refresh_token, token_type}`. Limite: 5 falhas por IP+e-mail a cada 60 s | 200, 401 "E-mail ou senha inválidos" (genérico), 429 + `Retry-After` |
| ✅ | POST | `/auth/refresh` | refresh token no corpo | Corpo `{refresh_token}`. Devolve `{access_token, token_type}` | 200, 401 |
| ✅ | GET | `/users/me` | Bearer (access) | Dados do usuário logado | 200, 401 |
| ✅ | POST | `/scores` | Bearer | Corpo `{pontos}` (0 a 200 000). Salva a pontuação do **usuário do token** (qualquer `user_id` no corpo é ignorado). Resposta: `{id, pontos, criado_em}` | 201, 401, 422 |
| ✅ | GET | `/scores/top` | Bearer | Top 10: o melhor resultado de cada jogador. `[{posicao, nome, pontos, voce}]` (sem e-mail) | 200, 401 |
| ✅ | GET | `/scores/me` | Bearer | `{recorde, partidas}` do usuário logado | 200, 401 |

## Convenções
- Corpo e resposta em JSON.
- Autenticação: header `Authorization: Bearer <access_token>`.
- Erros seguem o formato do FastAPI: `{"detail": "mensagem"}`.
- Mensagens de erro de login são genéricas (não revelam se o e-mail existe).
