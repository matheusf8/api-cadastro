# Etapa 2 — Cadastro

**Objetivo:** permitir criar uma conta com `POST /auth/register`, guardando a senha como hash.
**Resultado:** cadastro devolve 201 sem senha, e-mail repetido devolve 409, dados ruins devolvem 422. 18 testes passando.

## Conceitos novos
| Conceito | Analogia |
|---|---|
| **Hash de senha** | triturador de papel: dá para conferir se o picotado bate, não dá para remontar |
| **Sal (salt)** | pitada aleatória: a mesma senha gera hashes diferentes |
| **Schema Pydantic** | o porteiro: só deixa entrar dado no formato certo |
| **`response_model`** | o filtro de saída: só sai o que o schema permite |
| **409 × 422** | 409 = "conflito" (e-mail já existe); 422 = "dado inválido" |

## Passo a passo (o que foi feito e como)

### 1. `app/core/security.py` — hash de senha
Usei `pwdlib` com `PasswordHash.recommended()` (argon2id). Duas funções:
- `hash_password(senha)` → string `$argon2id$v=19$...`
- `verify_password(senha, hash)` → `True`/`False`

O sal e os parâmetros ficam dentro do próprio hash, então não preciso guardar nada além dele.

### 2. `app/schemas.py` — contrato da API
- **`UserCreate`** (entrada): `nome` (2 a 80, sem espaços nas pontas), `email` (`EmailStr`, convertido para minúsculo), `senha` (8 a 128).
  - O limite de 128 evita mandar uma "senha" gigante só para gastar CPU no hash.
  - E-mail em minúsculo: `Ana@X.com` e `ana@x.com` são a mesma pessoa.
- **`UserPublic`** (saída): `id`, `nome`, `email`, `criado_em`. **Não existe campo de senha**, então é impossível vazar. `from_attributes=True` deixa o Pydantic ler direto do model.

### 3. `app/routers/auth.py` — `POST /auth/register`
Fluxo da rota:
1. O Pydantic já validou o corpo (se inválido, 422 automático).
2. Procura o e-mail no banco; se existe, **409**.
3. Cria o `User` com `senha_hash=hash_password(...)`.
4. `commit()`. Se ocorrer `IntegrityError`, faz `rollback()` e devolve **409**.
5. Devolve **201** com o `UserPublic`.

**Por que checar duas vezes (passos 2 e 4)?** A checagem do passo 2 dá a mensagem amigável na maioria dos casos. Mas duas requisições simultâneas podem passar pelo passo 2 ao mesmo tempo; quem garante a regra de verdade é o `UNIQUE` do banco (passo 4).

### 4. Registrar o router
`main.py`: `app.include_router(auth.router)`. O `prefix="/auth"` fica no router.

### 5. Testes
`tests/test_security.py` (3):
- o hash não é a senha pura;
- senha certa passa e errada falha;
- mesma senha gera hashes diferentes (sal).

`tests/test_register.py` (10, contando os parametrizados):
- 201 e resposta sem `senha`/`senha_hash`;
- no banco a senha está como hash e `verify_password` confere;
- e-mail duplicado dá 409, inclusive com maiúsculas diferentes;
- e-mail inválido, senha curta, senha gigante, nome em branco, nome de 1 letra e campo ausente dão 422.

### 6. Verificação
| Checagem | Resultado |
|---|---|
| `pytest` | 18 passaram |
| Subir `uvicorn` e fazer `POST /auth/register` com `M@Teste.com` | 201, e-mail salvo como `m@teste.com` |
| Repetir a mesma chamada | 409 |
| Olhar o `app.db` | senha guardada como `$argon2id$v=19$m=65536,t=3,p=4$...` |

## Decisões e limites conscientes
- **Regra de senha simples** (só tamanho). Barra de força fica para o front (Etapa 6).
- **Cadastro revela se o e-mail existe** (409). É um trade-off comum: melhora a experiência, mas permite descobrir e-mails cadastrados. No **login** (Etapa 3) a mensagem de erro será genérica.
- Sem confirmação de e-mail (fora de escopo).

## Próximo passo
Etapa 3: login e JWT (a etapa principal de estudo).
