# Segurança: revisão e checklist

Revisão feita na Etapa 10. Cada linha diz **o que foi feito**, **onde** e **como foi verificado**.

## O que está protegido

| # | Risco | Defesa | Onde | Verificação |
|---|---|---|---|---|
| 1 | Vazamento de senha no banco | Só o **hash argon2** (com sal) é salvo | `core/security.py` | testes de hash; hash inspecionado no `app.db` |
| 2 | Senha na resposta da API | Schema de saída **sem campo de senha** | `schemas.UserPublic` | teste: resposta não tem `senha`/`senha_hash` |
| 3 | Forçar tokens (forjar JWT) | Assinatura HS256 com `SECRET_KEY` forte; **lista fixa de algoritmos** (bloqueia `alg: none`) | `security.decode_token` | testes: chave errada, `alg: none`, adulterado |
| 4 | Usar refresh como access (e vice-versa) | Claim `type` conferida | `decode_token` | testes dos dois sentidos |
| 5 | Token roubado vale pra sempre | Access de **15 min**; `exp` obrigatório | `config.py`, `decode_token` | teste de token expirado |
| 6 | `SECRET_KEY` fraca ou de exemplo | Em `ENVIRONMENT=production` a API **recusa subir**; em dev, aviso no log | `Settings.validar_segredo` | testes + execução real com chave `curta` |
| 7 | Descobrir e-mails pelo login | Mesma mensagem **e** mesmo custo de tempo (`DUMMY_HASH`) | `routers/auth.login` | teste: respostas idênticas |
| 8 | Força bruta no login | **429** após 5 falhas/min por IP+e-mail (+ `Retry-After`) | `core/rate_limit.py` | testes de unidade e de API; servidor real |
| 9 | Senhas gigantes para travar a CPU | Senha limitada a **128** caracteres | `schemas` | testes 422 |
| 10 | Falsificar dono da pontuação | `user_id` **só** do token; corpo ignorado | `routers/scores.py` | teste dedicado |
| 11 | Vazamento de e-mails no ranking | Ranking mostra só o **nome** | `schemas.RankingItem` | teste: sem e-mail |
| 12 | Outros sites usando a API pelo navegador | **CORS mínimo**: 1 origem, métodos GET/POST, cabeçalhos Authorization e Content-Type, **sem credenciais** | `main.py` | testes + preflight real (DELETE → 400) + navegador |
| 13 | Segredos no Git | `.env`, `.db`, `.venv` no `.gitignore`; só `.env.example` versionado | `.gitignore` | `git status` conferido a cada commit |
| 14 | Token em log/URL | Nenhum `print`/log de token; token só no cabeçalho | revisão de código (busca por `print`, `logging`, `console.log`) | grep sem ocorrências indevidas |
| 15 | XSS por HTML injetado | React escapa texto; **não há** `dangerouslySetInnerHTML` | `frontend/src` | grep sem ocorrências |
| 16 | Dependências vulneráveis | Auditoria | `pip-audit`, `npm audit --omit=dev` | **0 vulnerabilidades conhecidas** nas duas |

## Riscos que **restam** (conscientes)

| Risco | Por que fica | Como resolver |
|---|---|---|
| **Refresh token em `localStorage`** (XSS lê) | simplicidade; decisão #14 | refresh em cookie `httpOnly` + `SameSite`, API setando o cookie |
| **Sem revogação** de refresh token (logout só no cliente) | JWT é stateless | guardar `jti` no banco / lista de bloqueio; rotação do refresh |
| **Pontuação forjável** (jogo roda no navegador) | servidor não vê a partida | simular/validar a partida no servidor |
| **Rate limit em memória** e só no login | projeto de estudo | Redis; limite também em `register`/`refresh`; limite por IP |
| **HS256** com chave única | uma API só | RS256 (par de chaves) com vários serviços |
| **`/docs` exposto** | útil para estudo | desativar `docs_url` em produção |
| **Sem HTTPS** local | dev | HTTPS obrigatório em produção (token em texto puro no HTTP!) |
| **E-mail revelado no cadastro** (409) | UX | resposta neutra + confirmação por e-mail |
| **Sem confirmação de e-mail / recuperação de senha** | fora de escopo | fluxo com token único por e-mail |

## Como reproduzir as checagens
```powershell
cd backend
.venv\Scripts\Activate.ps1
pytest                                   # 74 testes
python -m pip_audit -r requirements.txt  # dependências do Python
cd ..\frontend
npm audit --omit=dev                     # dependências do front
```
