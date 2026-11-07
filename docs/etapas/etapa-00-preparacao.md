# Etapa 0 — Preparação

**Objetivo:** deixar o ambiente e a arquitetura prontos, com back e front conversando.
**Resultado:** `GET /health` responde, o front mostra "Backend: online", 1 teste passando.

## Passo a passo (o que foi feito e como)

### 1. Verificar ferramentas
```powershell
python --version; node --version; npm --version; git --version
```
Python 3.12, Node 22, npm 10, Git 2.49. Sem isso nada roda.

### 2. Repositório e pastas
```powershell
git init
mkdir backend\app\routers, backend\app\core, backend\tests, docs
```
Separei `backend/` e `frontend/` no mesmo repositório (monorepo). Dentro do back, `core/` guarda o que é transversal (config, segurança) e `routers/` os endpoints.

### 3. Ambiente virtual e dependências do backend
```powershell
python -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install fastapi "uvicorn[standard]" sqlalchemy pyjwt "pwdlib[argon2]" pydantic-settings "pydantic[email]" pytest httpx
```
- **venv** isola as bibliotecas do projeto das de outros projetos.
- Versões exatas foram anotadas em `backend/requirements.txt` (qualquer pessoa reproduz com `pip install -r requirements.txt`).

### 4. Configuração (`app/core/config.py`)
Usei `pydantic-settings`: uma classe `Settings` lê as variáveis do arquivo `.env`. Segredo e prazos de token ficam fora do código. Criei `.env.example` (vai pro Git, sem segredo) e `.env` (ignorado pelo Git) com uma `SECRET_KEY` gerada por `secrets.token_urlsafe(64)`.

### 5. Primeira rota e app
- `routers/health.py`: `GET /health` devolve `{"status": "ok"}`.
- `main.py`: cria o `FastAPI`, adiciona o **CORS** (libera só `http://localhost:5173`) e registra o router.

**Por que CORS?** O navegador bloqueia o front (porta 5173) de chamar a API (porta 8000) a menos que a API diga que permite aquela origem.

### 6. Primeiro teste
`tests/test_health.py` usa o `TestClient` do FastAPI (chama a API sem subir servidor). `pytest.ini` define `pythonpath = .` para os imports `from app...` funcionarem.

### 7. Frontend
```powershell
npx create-vite@latest frontend --template react --no-interactive
cd frontend
npm install
npm install react-router-dom axios
npm install -D tailwindcss @tailwindcss/vite
```
- Tirei os arquivos de exemplo do template.
- `vite.config.js`: plugin do Tailwind e alias `@` → `src/`.
- `index.css`: `@import "tailwindcss"` e `@theme` com os tokens (cores e fonte).
- `src/api/client.js`: instância única do Axios, `baseURL` vinda de `VITE_API_URL`.
- `src/pages/Status.jsx`: chama `/health` e mostra online/offline.
- Pastas vazias já criadas: `components/`, `auth/`, `game/`.

### 8. Documentação
`README.md`, `docs/arquitetura.md`, `docs/decisoes.md`, `docs/api.md`.

### 9. Verificação
| Checagem | Resultado |
|---|---|
| `pytest` | 1 passou |
| `npm run build` | ok |
| `uvicorn` + `curl -H "Origin: http://localhost:5173" /health` | 200 e header `access-control-allow-origin` |

## Problema encontrado
O primeiro `npm create vite` gerou um projeto **vanilla TypeScript** em vez de React. Refiz com `npx create-vite@latest ... --template react --no-interactive`.
