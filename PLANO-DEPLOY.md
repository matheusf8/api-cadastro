# 🚀 PLANO DE DEPLOY — Rebote no ar para até 5 pessoas

> Objetivo: o Rebote rodando na internet, com link fixo, para o Matheus, a esposa e mais até 3 convidados jogarem e disputarem o ranking. Custo **zero**.

## Arquitetura do deploy

```
 Navegador (celular / PC)
        │  https://rebote.vercel.app
        ▼
 ┌──────────────┐   HTTPS + JWT    ┌──────────────┐     SQL      ┌──────────────┐
 │ Frontend     │ ───────────────► │ Backend      │ ───────────► │ Banco        │
 │ Vercel       │                  │ Render       │              │ Neon         │
 │ (React/Vite) │ ◄─────────────── │ (FastAPI)    │ ◄─────────── │ (Postgres)   │
 └──────────────┘                  └──────────────┘              └──────────────┘
```

| Peça | Onde | Por quê |
|---|---|---|
| Frontend | **Vercel** (grátis) | Site estático do Vite, HTTPS automático, deploy a cada push. Você já usou no e-commerce. |
| Backend | **Render** (grátis) | Roda o FastAPI direto do GitHub. Você já usou. |
| Banco | **Neon** (Postgres grátis) | O disco do Render grátis é **apagado** a cada reinício: o SQLite perderia contas e ranking. O Neon guarda os dados de verdade. |

## Decisões e por quê

| # | Decisão | Motivo | Alternativa |
|---|---|---|---|
| 1 | **Trocar SQLite por Postgres (Neon) só em produção** | Dados não podem sumir quando o servidor reinicia. O código já usa SQLAlchemy: basta trocar a `DATABASE_URL`. Local continua com SQLite. | Render com disco persistente (pago). |
| 2 | **Código de convite no cadastro** | Sem isso, qualquer pessoa com o link cria conta. Com um `INVITE_CODE` (variável de ambiente), só quem recebeu o código se cadastra. | Lista de e-mails permitidos, ou fechar o cadastro depois de criar as 5 contas. |
| 3 | **Limite de contas (`MAX_USERS=5`)** | Segunda trava: mesmo que o código vaze, não passa de 5. | Só o código de convite. |
| 4 | **Sem Docker por enquanto** | Render roda Python direto; menos coisas para dar errado no primeiro deploy. Docker fica como etapa opcional. | Dockerfile já na primeira versão. |

## Limites que você precisa saber (sem surpresa)

- **Render grátis "dorme"** depois de 15 min sem uso. O primeiro acesso depois disso demora **~50 segundos** para acordar. Depois fica rápido. Para 5 pessoas jogando em casa, isso é aceitável.
- **Neon grátis** suspende o banco quando ninguém usa e acorda sozinho (1–2 s). Sobra espaço para milhares de partidas.
- **Pontuação ainda pode ser forjada** por quem souber usar o F12 (risco já documentado). Entre família, sem problema.

---

## Etapas

### Etapa D1 — Preparar o backend para Postgres
- [x] Adicionar o driver `psycopg[binary]` ao `requirements.txt`
- [x] Testar localmente apontando a `DATABASE_URL` para um Postgres (feito com Postgres em Docker)
- [x] Rodar os testes de novo (continuam no SQLite em memória; agora são 84)
- **Pronto quando:** a API sobe conectada ao Neon e cria as tabelas sozinha.

### Etapa D2 — Fechar o cadastro para convidados
- [x] Novas configurações: `INVITE_CODE` e `MAX_USERS`
- [x] Campo **"Código de convite"** no `UserCreate` e na tela de cadastro
- [x] Código errado → 403; limite atingido → 403 com mensagem clara
- [x] Em `dev` sem código configurado, o cadastro continua livre (não atrapalha estudo)
- [x] Testes: código certo, código errado, limite atingido
- **Pronto quando:** sem o código não se cria conta, e a 6ª conta é recusada.

### Etapa D3 — Preparar o frontend para produção
- [x] `vercel.json` com rewrite para `index.html` (senão `/jogo` dá 404 ao recarregar)
- [x] `VITE_API_URL` e `VITE_EXIGE_CONVITE` lidas de variável de ambiente (os valores entram no painel da Vercel, na D4)
- [x] Mensagem amigável enquanto o Render acorda ("Acordando o servidor, aguarde…")
- **Pronto quando:** `npm run build` gera o site e as rotas funcionam ao recarregar.

- 📄 Registro das etapas D1 a D3: [docs/etapas/etapa-11-preparacao-deploy.md](docs/etapas/etapa-11-preparacao-deploy.md)

### Etapa D4 — Criar os serviços (você faz o login, eu guio)
- [ ] **Neon:** criar projeto `rebote` e copiar a connection string
- [ ] **Render:** novo Web Service a partir do repo `api-cadastro`, pasta `backend`
  - Build: `pip install -r requirements.txt`
  - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - Variáveis: `PYTHON_VERSION=3.12.10`, `ENVIRONMENT=production`, `SECRET_KEY` (nova, forte), `DATABASE_URL` (Neon), `FRONTEND_ORIGIN` (URL da Vercel), `INVITE_CODE`, `MAX_USERS=5`
- [ ] **Vercel:** importar o repo, pasta `frontend`, variáveis `VITE_API_URL` e `VITE_EXIGE_CONVITE=true`
- [ ] Voltar no Render e acertar o `FRONTEND_ORIGIN` com a URL final da Vercel
- **Pronto quando:** os três painéis mostram "deploy ok".

> Segredos (`SECRET_KEY`, connection string, código de convite) vão **só** nos painéis do Render/Vercel. Nunca em arquivo nem no GitHub.

### Etapa D5 — Testar em produção
- [ ] `/health` e `/health/db` respondendo na URL do Render
- [ ] Cadastro com código, login, jogar, pontuação no ranking
- [ ] Abrir no **celular** (a esposa provavelmente vai jogar por lá)
- [ ] Cadastro sem código é recusado; preflight de outra origem é recusado (CORS)
- [ ] API recusa subir com `SECRET_KEY` fraca (já existe, só confirmar)
- **Pronto quando:** você e sua esposa jogam de aparelhos diferentes e aparecem no mesmo ranking.

### Etapa D6 — Documentar
- [ ] README: link do site no ar e seção "Deploy" (arquitetura acima + variáveis)
- [ ] `docs/etapas/etapa-11-deploy.md` com o passo a passo e o que deu errado
- [ ] `docs/decisoes.md`: decisões 21+ (Neon, convite, limite)
- **Pronto quando:** alguém lendo o README entende onde cada peça roda.

### Etapa D7 (opcional) — Docker
- [ ] `Dockerfile` do backend e `docker-compose.yml` (API + Postgres) para rodar igual à produção na sua máquina
- **Por quê:** Docker + deploy é exatamente o que vaga de backend júnior pede.

---

## O que precisa de você
1. Ter conta (ou logar) no **Neon**, **Render** e **Vercel** — eu não crio contas nem digito senhas.
2. Escolher o **código de convite** e passar para sua esposa pessoalmente.
3. Dar o **ok para cada push** no GitHub (o Render e a Vercel fazem deploy a partir dele).

## Ordem e esforço estimado
| Etapa | Quem | Tempo |
|---|---|---|
| D1–D3 (código) | eu, você revisa | ~1 sessão |
| D4 (painéis) | você clica, eu guio | ~30 min |
| D5–D6 | juntos | ~30 min |
| D7 | opcional | ~1 sessão |
