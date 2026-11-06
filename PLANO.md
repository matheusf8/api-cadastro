# 📋 PLANO — api_cadastro

> Gerente: **Léo (Tech Lead)** · Dono: Matheus · Foco: **aprender JWT** e ter um projeto para contar em entrevista.

## Visão
Login e cadastro modernos protegidos por JWT. Depois de logar, o usuário cai num **mini jogo da bolinha que rebate** (estilo Breakout) com placar salvo no banco. O jogo existe também para **provar que o JWT funciona**: só quem está logado joga e salva pontuação.

## Stack
| Camada | Escolha | Por quê (para falar na entrevista) |
|---|---|---|
| API | FastAPI | rápido, validação automática com Pydantic, docs em `/docs` |
| Banco | SQLite + SQLAlchemy | zero configuração; ORM facilita trocar para Postgres depois |
| Senha | hash com argon2/bcrypt | nunca guardar senha pura |
| Token | JWT (PyJWT) | autenticação stateless |
| Front | React + Vite | build rápido, padrão de mercado |
| Estilo | Tailwind CSS | visual moderno sem escrever CSS do zero |
| Jogo | Canvas + `requestAnimationFrame` | aprender loop de jogo sem biblioteca |
| Testes | pytest (back) | provar que a auth funciona |

## Estrutura de pastas
```
api_cadastro/
├── PLANO.md
├── backend/
│   ├── app/ (main.py, config.py, database.py, models.py, schemas.py, security.py, routers/)
│   ├── tests/
│   └── .env
└── frontend/
    └── src/ (pages/, components/, api/, auth/, game/)
```

## Fluxo de autenticação (o coração do estudo)
1. **Cadastro:** `POST /auth/register` → valida → gera hash → salva → 201.
2. **Login:** `POST /auth/login` → confere hash → devolve **access token** (curto, ~15 min) e **refresh token** (longo, ~7 dias).
3. **Acesso:** front manda `Authorization: Bearer <access>` → dependência `get_current_user` valida assinatura e expiração.
4. **Renovação:** access expirou → `POST /auth/refresh` → novo access.
5. **Logout:** front descarta os tokens (e, na etapa de segurança, o refresh é invalidado).

---

## Etapas

### Etapa 0 — Preparação
- [x] Criar `backend/` com venv e `requirements.txt` (fastapi, uvicorn, sqlalchemy, pyjwt, pwdlib[argon2], pydantic-settings, pytest, httpx)
- [x] Criar `frontend/` com Vite (React + Tailwind + Router + Axios)
- [x] `git init`, `.gitignore` (venv, node_modules, `.env`, `*.db`)
- [x] Documentação: `README.md`, `docs/arquitetura.md`, `docs/decisoes.md`, `docs/api.md`
- [x] `GET /health` + teste + página de status no front provando a comunicação (CORS)
- 📄 Registro: [docs/etapas/etapa-00-preparacao.md](docs/etapas/etapa-00-preparacao.md)
- **Aprende:** estrutura de projeto, ambiente virtual, por que `.env` fica fora do Git.
- **Pronto quando:** `uvicorn` sobe e mostra `/docs`; `npm run dev` mostra a página do Vite.

### Etapa 1 — Backend base + banco
- [x] `config.py` lendo `SECRET_KEY`, `ALGORITHM`, tempos de expiração do `.env`
- [x] `database.py` (engine SQLite, sessão) e `deps.py` (`get_db`)
- [x] Modelo `User` (id, nome, email único, senha_hash, criado_em)
- [x] Testes com banco em memória e `GET /health/db`
- 📄 Registro: [docs/etapas/etapa-01-backend-banco.md](docs/etapas/etapa-01-backend-banco.md)
- **Aprende:** ORM, sessão por requisição (injeção de dependência), constraint de unicidade.
- **Pronto quando:** tabela criada no `app.db`, rota `GET /health` responde.

### Etapa 2 — Cadastro
- [x] Schemas Pydantic (`UserCreate` com validação de e-mail e senha mínima, `UserPublic` **sem** senha)
- [x] `security.py`: `hash_password` e `verify_password`
- [x] `POST /auth/register` (409 se e-mail já existe)
- 📄 Registro: [docs/etapas/etapa-02-cadastro.md](docs/etapas/etapa-02-cadastro.md)
- **Aprende:** hash × criptografia, por que nunca devolver senha, status codes (201, 409, 422).
- **Pronto quando:** cadastro funciona no `/docs` e a senha no banco aparece como hash.

### Etapa 3 — Login e JWT ⭐ (etapa principal)
- [x] `create_access_token` e `create_refresh_token` (claims `sub`, `exp`, `type`)
- [x] `POST /auth/login` (mensagem genérica em erro: não revelar se foi e-mail ou senha)
- [x] Dependência `get_current_user` + `GET /users/me` protegido
- [x] `POST /auth/refresh`
- 📄 Registro: [docs/etapas/etapa-03-login-jwt.md](docs/etapas/etapa-03-login-jwt.md)
- **Aprende:** as 3 partes do JWT (header.payload.signature), assinatura × criptografia, expiração, 401 × 403, abrir um token em jwt.io e ler o payload.
- **Pronto quando:** `/users/me` dá 401 sem token, 200 com token válido, 401 com token expirado.

### Etapa 4 — Testes e segurança do back
- [x] pytest: cadastro ok, e-mail duplicado, login ok, senha errada, rota protegida com e sem token, token expirado
- [x] CORS liberando só a origem do front (com testes)
- [x] Limite de tentativas de login (rate limit simples, 429 + Retry-After)
- 📄 Registro: [docs/etapas/etapa-04-testes-seguranca.md](docs/etapas/etapa-04-testes-seguranca.md)
- **Aprende:** teste com `TestClient`, banco de teste isolado, o que CORS realmente protege.
- **Pronto quando:** `pytest` verde.

### Etapa 5 — Frontend base e design system
- [x] Tailwind, fonte moderna, paleta (escura com destaque neon/gradiente), componentes `Input`, `Button`, `Card` (+ `Background`, `AuthLayout`)
- [x] React Router: `/login`, `/cadastro`, `/jogo` (+ `/status` e 404)
- 📄 Registro: [docs/etapas/etapa-05-frontend-design-system.md](docs/etapas/etapa-05-frontend-design-system.md)
- **Aprende:** componentização, roteamento, tokens de design.
- **Pronto quando:** as 3 rotas navegam e os componentes são reaproveitados.

### Etapa 6 — Telas de login e cadastro (visual bacana)
- [x] Layout dividido com vidro (glassmorphism) e fundo animado sutil
- [x] Validação no front (e-mail, força da senha com barrinha, confirmar senha)
- [x] Mostrar/ocultar senha, estados de loading e erro, animações de entrada
- [x] Responsivo (celular e desktop) e acessível (labels, foco, `aria-*`)
- 📄 Registro: [docs/etapas/etapa-06-telas-login-cadastro.md](docs/etapas/etapa-06-telas-login-cadastro.md)
- **Aprende:** formulários controlados, estado de erro, UX de autenticação.
- **Pronto quando:** telas bonitas e funcionais ainda sem API (dados mockados).

### Etapa 7 — Integrar front com a API
- [x] Cliente HTTP (axios) com `baseURL` em variável de ambiente
- [x] `AuthContext`: guarda usuário/token, funções `login`, `register`, `logout`
- [x] Interceptor: anexa o `Bearer` e, ao receber 401, tenta `/auth/refresh` uma vez (single-flight)
- [x] `ProtectedRoute` (e `GuestRoute`): sem token, redireciona para `/login`
- 📄 Registro: [docs/etapas/etapa-07-integracao-front-api.md](docs/etapas/etapa-07-integracao-front-api.md)
- **Aprende:** onde guardar token (memória × localStorage × cookie httpOnly: prós, contras e risco de XSS/CSRF), Context API, interceptors.
- **Pronto quando:** cadastra, loga, recarrega a página e continua logado; logout bloqueia o `/jogo`.

### Etapa 8 — Mini jogo da bolinha 🎮
- [ ] `<canvas>` com loop de `requestAnimationFrame`
- [ ] Bola com física simples (velocidade, rebate nas paredes) e raquete controlada por mouse/teclado/toque
- [ ] Tijolos (opcional, estilo Breakout), vidas, pontuação, game over e reiniciar
- [ ] Visual: bola com brilho/rastro, partículas ao quebrar tijolo, fundo combinando com o login
- [ ] Pausar (tecla Espaço) e dificuldade crescente (bola acelera)
- **Aprende:** game loop, colisão retângulo × círculo, `useRef` e `useEffect` para canvas, limpar o loop ao desmontar.
- **Pronto quando:** dá para jogar do início ao game over a 60 fps sem vazamento de loop.

### Etapa 9 — Placar ligado ao JWT
- [ ] Modelo `Score` (user_id, pontos, criado_em)
- [ ] `POST /scores` (protegido) e `GET /scores/top` (ranking top 10 com nome)
- [ ] Mostrar ranking e "seu recorde" ao lado do jogo; header com nome do usuário e botão sair
- **Aprende:** relacionamento 1:N, rota protegida usando o usuário do token (nunca confiar em `user_id` vindo do body).
- **Pronto quando:** pontuação salva por usuário e ranking aparece.

### Etapa 10 — Polimento e entrevista
- [ ] README com prints/GIF, como rodar, diagrama do fluxo JWT
- [ ] Revisar segurança: segredo forte, expiração, sem token em log, mensagens de erro genéricas
- [ ] (Opcional) Dockerfile ou deploy (Render/Vercel)
- [ ] Nota no diário `minha-progamacao/` com tudo que aprendeu
- [ ] **Treino de entrevista com o Léo:** explicar o projeto em 2 minutos
- **Pronto quando:** repositório público no GitHub, README bonito e roteiro de fala pronto.

---

## Roteiro de entrevista (perguntas que devo saber responder)
1. O que é JWT e como ele é validado sem consultar o banco?
2. Diferença entre hash, criptografia e assinatura?
3. Por que access token curto + refresh token?
4. Onde guardou o token no front e quais os riscos (XSS, CSRF)?
5. 401 × 403: quando usa cada um?
6. O que o CORS protege e o que não protege?
7. Como a rota `/scores` sabe quem é o usuário sem receber o id?
8. Como funciona o loop do jogo e como evitou vazamento ao sair da tela?
9. O que melhoraria com mais tempo (refresh em cookie httpOnly, revogação, Postgres, testes no front)?

## Fora de escopo (para não inflar)
Recuperar senha por e-mail, login social, perfis/roles, multiplayer. Podem virar "próximos passos" na conversa.
