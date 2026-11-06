# 🎮 API Cadastro

Projeto de estudo full stack: **cadastro e login com JWT** e, depois de logar, um **mini jogo da bolinha que rebate** com ranking salvo no banco.

| Camada | Tecnologia |
|---|---|
| API | Python 3.12 · FastAPI · SQLAlchemy · SQLite |
| Autenticação | JWT (PyJWT) · hash de senha com argon2 |
| Front | React 19 · Vite · Tailwind CSS · React Router · Axios |
| Testes | pytest |

> Status: **Etapas 0 a 7 concluídas** (backend com 51 testes; frontend integrado à API, com sessão persistente e rota protegida). Falta o jogo (Etapas 8 e 9). Andamento em [PLANO.md](PLANO.md); o registro de cada etapa (passo a passo e como foi feito) está em [docs/etapas/](docs/etapas/).

## Como rodar

Pré-requisitos: Python 3.12+, Node 22+.

### 1. Backend
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env        # e troque a SECRET_KEY
uvicorn app.main:app --reload
```
API em http://localhost:8000 · documentação interativa em http://localhost:8000/docs

### 2. Frontend
```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```
App em http://localhost:5173 (a página mostra se o backend está online).

### 3. Testes
```powershell
cd backend
.venv\Scripts\Activate.ps1
pytest
```

## Estrutura

```
api_cadastro/
├── README.md               ← você está aqui
├── PLANO.md                ← etapas e checklist (fonte da verdade)
├── docs/
│   ├── arquitetura.md      ← camadas, pastas e fluxo JWT
│   ├── decisoes.md         ← por que cada tecnologia (roteiro de entrevista)
│   ├── api.md              ← contrato dos endpoints
│   └── etapas/             ← um .md por etapa: passo a passo e como foi feito
├── backend/
│   ├── app/
│   │   ├── main.py         ← cria o app, CORS, registra routers
│   │   ├── core/           ← config.py, security.py (hash de senha e JWT), rate_limit.py (limite de login)
│   │   ├── schemas.py      ← contrato de entrada/saída (Pydantic)
│   │   ├── database.py     ← engine, sessão e Base
│   │   ├── models.py       ← tabelas (User)
│   │   ├── deps.py         ← get_db e get_current_user (a "catraca" do JWT)
│   │   └── routers/        ← health, auth (register/login/refresh), users (/me)
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/
        ├── api/            ← client.js (Axios + interceptors), auth.js, errors.js
        ├── auth/           ← tokenStore, AuthContext, useAuth, ProtectedRoute/GuestRoute
        ├── components/     ← Input, PasswordInput, StrengthMeter, FormAlert, Button, Card, Background, AuthLayout
        ├── lib/            ← cn, validators (regras e força da senha), useForm
        ├── game/           ← lógica e canvas do jogo
        ├── pages/          ← uma tela por rota
        └── index.css       ← tokens de design (cores, fonte)
```

Detalhes e justificativas em [docs/arquitetura.md](docs/arquitetura.md).

## Segurança (resumo)
- Senha nunca é guardada pura: só o hash argon2.
- `SECRET_KEY` e demais segredos ficam no `.env`, que está no `.gitignore`.
- CORS libera somente a origem do front.
