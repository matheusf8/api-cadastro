# Como rodar o Rebote (passo a passo)

Você vai abrir **2 terminais**: um para o **backend** (a API) e outro para o **frontend** (a tela). Os dois ficam abertos ao mesmo tempo.

> Dica no Cursor/VS Code: menu **Terminal → New Terminal**, e o botão **+** no painel para abrir o segundo.

## Antes de começar (só na primeira vez)

Você precisa ter instalado: **Python 3.12+** e **Node 22+**.
Para conferir, rode `python --version` e `node --version`.

---

## Terminal 1 — Backend (API)

**1. Entre na pasta do backend**
```powershell
cd backend
```

**2. Crie o ambiente virtual e instale as dependências** (só na primeira vez)
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**3. Crie o arquivo `.env`** (só na primeira vez)
```powershell
copy .env.example .env
```
Abra o `.env` e troque a `SECRET_KEY` por uma chave longa. O comando para gerar uma está escrito dentro do próprio arquivo.

**4. Ative o ambiente virtual** (toda vez que abrir um terminal novo)
```powershell
.venv\Scripts\Activate.ps1
```
Deve aparecer `(.venv)` no começo da linha.

**5. Suba a API**
```powershell
uvicorn app.main:app --reload
```
Pronto quando aparecer `Application startup complete`.
Deixe esse terminal aberto.

- API: http://localhost:8000
- Documentação interativa: http://localhost:8000/docs

---

## Terminal 2 — Frontend (tela)

**1. Entre na pasta do frontend** (a partir da raiz do projeto)
```powershell
cd frontend
```

**2. Instale as dependências** (só na primeira vez)
```powershell
npm install
```

**3. Crie o arquivo `.env`** (só na primeira vez)
```powershell
copy .env.example .env
```

**4. Suba o front**
```powershell
npm run dev
```

**5. Abra no navegador:** http://localhost:5173

---

## O que fazer para ver funcionando

1. Clique em **criar conta** e cadastre nome, e-mail e senha.
2. Faça **login**. Você cai no jogo.
3. Jogue: **mouse ou setas** movem a raquete, **Espaço** ou **P** pausa.
4. Ao perder as vidas, a pontuação é salva e aparece no **ranking**.

## Para ver o JWT de verdade

1. Aperte **F12** e abra a aba **Network**.
2. Faça login e clique nas chamadas `login`, `me` e `scores`.
3. Em *Request Headers* aparece `Authorization: Bearer ...`. Esse é o token.
4. Cole o token em https://jwt.io para ler o conteúdo (`sub`, `type`, `exp`).

---

## Resumo rápido (depois da primeira vez)

| Terminal | Comandos |
|---|---|
| 1 (backend) | `cd backend` → `.venv\Scripts\Activate.ps1` → `uvicorn app.main:app --reload` |
| 2 (frontend) | `cd frontend` → `npm run dev` |

Para **parar**, clique no terminal e aperte `Ctrl + C`.

---

## Deu erro?

| Problema | Solução |
|---|---|
| `uvicorn` não é reconhecido | O ambiente virtual não está ativo. Rode `.venv\Scripts\Activate.ps1` dentro de `backend`. |
| Não consigo rodar o `Activate.ps1` (política de execução) | Rode `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` e tente de novo. |
| Porta 8000 em uso | Tem outro servidor rodando. Feche o terminal dele, ou use `uvicorn app.main:app --reload --port 8001` e ajuste a URL da API no `frontend\.env`. |
| Erro de CORS no navegador | O front precisa estar em `http://localhost:5173` (o backend só aceita essa origem). |
| A tela abre mas não loga | Confira se o Terminal 1 está rodando. A página http://localhost:5173/status mostra se o front enxerga a API. |
| Cadastro diz que o e-mail já existe | Use outro e-mail, ou apague o arquivo `backend\app.db` com a API parada para começar do zero. |
| Muitas tentativas de login erradas | Espere 1 minuto. É o limite de tentativas funcionando. |

## Rodar os testes (opcional)

```powershell
# backend (com o venv ativo, dentro de backend)
pytest

# frontend (dentro de frontend)
npm test
```
