# 🎮 API Cadastro

Projeto de estudo full stack: **cadastro e login com JWT** e, depois de logar, um **mini jogo da bolinha que rebate** com ranking salvo no banco.

| Camada | Tecnologia |
|---|---|
| API | Python 3.12 · FastAPI · SQLAlchemy · SQLite |
| Autenticação | JWT (PyJWT) · hash de senha com argon2 |
| Front | React 19 · Vite · Tailwind CSS · React Router · Axios |
| Testes | pytest |

> Status: **Etapa 0 concluída** (ambiente e arquitetura). Veja o andamento em [PLANO.md](PLANO.md).

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
│   └── api.md              ← contrato dos endpoints
├── backend/
│   ├── app/
│   │   ├── main.py         ← cria o app, CORS, registra routers
│   │   ├── core/           ← config.py (e, depois, security.py)
│   │   ├── routers/        ← endpoints, um arquivo por assunto
│   │   └── (database.py, models.py, schemas.py, deps.py  ← Etapas 1 a 3)
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/
        ├── api/            ← cliente HTTP
        ├── auth/           ← contexto de login e rota protegida
        ├── components/     ← peças reutilizáveis (Input, Button, Card)
        ├── game/           ← lógica e canvas do jogo
        ├── pages/          ← uma tela por rota
        └── index.css       ← tokens de design (cores, fonte)
```

Detalhes e justificativas em [docs/arquitetura.md](docs/arquitetura.md).

## Segurança (resumo)
- Senha nunca é guardada pura: só o hash argon2.
- `SECRET_KEY` e demais segredos ficam no `.env`, que está no `.gitignore`.
- CORS libera somente a origem do front.
