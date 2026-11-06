# Etapa 3 — Login e JWT ⭐

**Objetivo:** autenticar o usuário e proteger rotas com JWT (a etapa principal de estudo).
**Resultado:** `POST /auth/login`, `POST /auth/refresh` e `GET /users/me` (protegida). 39 testes passando.

## Conceitos novos
| Conceito | Analogia |
|---|---|
| **JWT** | pulseira de festa: o segurança confere a pulseira e não volta à lista de convidados toda hora |
| **Assinatura** | lacre: se alguém mexer no conteúdo, o lacre quebra. **Não esconde** o conteúdo |
| **Access token** (15 min) | ingresso do dia |
| **Refresh token** (7 dias) | cartão de membro que renova o ingresso |
| **`get_current_user`** | a catraca da rota |
| **401 × 403** | 401 = "não sei quem você é"; 403 = "sei quem você é, mas não pode" |

### As 3 partes de um JWT
```
eyJhbGciOiJIUzI1NiJ9 . eyJzdWIiOiIxIiwidHlwZSI6ImFjY2VzcyJ9 . 3kq...
      header                       payload                    signature
   (algoritmo)             (claims: sub, type, iat, exp)    (assinatura com SECRET_KEY)
```
O payload é só Base64: **qualquer um lê** (cole em jwt.io). Por isso nunca vai senha nem dado sensível nele. O que o servidor garante é que **ninguém alterou**.

## Passo a passo (o que foi feito e como)

### 1. `core/security.py` — criar e validar tokens
- `create_token(user_id, tipo, expires_delta)` monta o payload e assina com `jwt.encode(..., SECRET_KEY, HS256)`.
  - `sub`: id do usuário **como texto** (exigência do padrão/PyJWT)
  - `type`: `"access"` ou `"refresh"`
  - `iat`: emitido em · `exp`: expira em
- `create_access_token` (15 min) e `create_refresh_token` (7 dias) usam os prazos do `.env`.
- `decode_token(token, tipo_esperado)` usa `jwt.decode` com:
  - `algorithms=[settings.algorithm]` **lista fixa**: bloqueia o ataque em que o token se declara `alg: none` (sem assinatura);
  - `require: [exp, sub, type]`: token sem esses campos é recusado;
  - confere o `type`: um refresh **não** serve como access, e vice-versa.
  - O PyJWT confere assinatura e expiração sozinho.

### 2. `schemas.py` — contratos novos
`LoginRequest` (`email`, `senha`), `TokenPair` (`access_token`, `refresh_token`, `token_type="bearer"`), `RefreshRequest`, `AccessToken`.

### 3. `POST /auth/login`
1. Busca o usuário pelo e-mail.
2. **Sempre** executa um `verify_password`: se o e-mail não existe, confere contra um `DUMMY_HASH`. Assim o tempo de resposta é parecido e não dá para descobrir e-mails cadastrados medindo (ataque de *timing*).
3. Erro (e-mail ou senha) devolve **o mesmo** `401 "E-mail ou senha inválidos"`.
4. Sucesso devolve o par de tokens.

### 4. `deps.py` — `get_current_user` (a catraca)
- `HTTPBearer(auto_error=False)` lê `Authorization: Bearer <token>`.
- Sem header, assinatura ruim, expirado, tipo errado ou usuário apagado: **o mesmo 401** com `WWW-Authenticate: Bearer`. Não dar pista a quem ataca.
- Se tudo certo, devolve o `User` do banco.
- Usei `auto_error=False` porque assim controlo o código (sempre 401, nunca 403 por ausência de header).

### 5. `GET /users/me`
Rota protegida: `user: User = Depends(get_current_user)`. Devolve `UserPublic`.

### 6. `POST /auth/refresh`
Valida o refresh (`type="refresh"`), confere se o usuário ainda existe e devolve um novo access.

### 7. Testes (`tests/test_jwt.py`, 21)
- **Tokens:** 3 partes, claims corretos, payload legível sem a chave (prova que é público) e sem senha dentro.
- **Rejeições:** tipo errado, expirado, assinado com outra chave, `alg: none`.
- **Login:** ok, senha errada, e-mail inexistente (mensagem **idêntica**), e-mail com maiúsculas.
- **`/users/me`:** sem token 401, válido 200, expirado 401, adulterado 401, lixo 401, refresh no lugar do access 401, usuário apagado 401.
- **Refresh:** novo access funciona, access no lugar do refresh 401, expirado 401, chave falsa 401.

### 8. Verificação
| Checagem | Resultado |
|---|---|
| `pytest` | 39 passaram |
| Servidor real: cadastro, login, `/users/me` sem token | 401 |
| Servidor real: `/users/me` com o access token | 200 com os dados do usuário |

## Decisões e limites conscientes
- **Refresh token sem revogação**: não dá para invalidá-lo antes de expirar (logout no servidor). Solução futura: guardar `jti` no banco ou lista de bloqueio. Boa resposta de "o que melhoraria".
- **Sem rotação de refresh**: o mesmo refresh vale por 7 dias.
- **HS256** (chave compartilhada): simples para uma API só. Com vários serviços usaria RS256 (chave pública/privada).
- A `SECRET_KEY` precisa ser longa e secreta; quem a tem forja tokens.

## Para a entrevista
- O que é JWT e como é validado **sem consultar o banco**? (confere a assinatura e o `exp`)
- Por que não colocar dados sensíveis no payload? (é Base64, qualquer um lê)
- Assinatura × criptografia × hash?
- Por que access curto + refresh longo?
- 401 × 403?
- Por que a mesma mensagem para e-mail e senha errados? E por que o `DUMMY_HASH`?
- O que é o ataque `alg: none` e como a lista fixa de algoritmos protege?
- Como invalidar um JWT antes de expirar? (limitação do modelo stateless)

## Próximo passo
Etapa 4: testes e segurança do back (CORS testado e limite de tentativas de login).
