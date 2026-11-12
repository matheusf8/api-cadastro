# Etapa 11 — Preparação para o deploy (D1 a D3)

**Objetivo:** deixar o código pronto para rodar na internet para até 5 convidados: banco que não perde dados, cadastro fechado e frontend ajustado para produção.
**Resultado:** a API funciona com Postgres, o cadastro exige código de convite e respeita um teto de contas, e o front tem campo de convite, aviso de "servidor acordando" e configuração da Vercel. Backend com **84 testes**. Plano completo em [PLANO-DEPLOY.md](../../PLANO-DEPLOY.md).

## Conceitos novos
| Conceito | Analogia |
|---|---|
| **Disco efêmero** | a bancada da cozinha: é limpa a cada turno. O que precisa durar vai para a despensa (o banco separado) |
| **Driver de banco** | o "adaptador de tomada" entre o Python e o Postgres (aqui, o `psycopg`) |
| **`pool_pre_ping`** | dizer "alô, está aí?" antes de falar ao telefone, porque a ligação pode ter caído |
| **403 Forbidden** | o porteiro entendeu o pedido, mas você não está na lista |
| **Comparação em tempo constante** | conferir o código inteiro sempre, sem parar no primeiro erro, para o tempo não dar pistas |
| **Rewrite de SPA** | qualquer endereço entrega o mesmo `index.html`; quem decide a tela é o React Router |

## Passo a passo (o que foi feito e como)

### D1 — Backend pronto para Postgres
1. **Driver:** `psycopg[binary]==3.3.9` no `requirements.txt`.
2. **`normalizar_url()` em `app/database.py`:** o Neon entrega a URL como `postgresql://...`. Sem dizer o driver, o SQLAlchemy procuraria o `psycopg2` (não instalado). A função troca o começo para `postgresql+psycopg://`. URLs de SQLite passam sem mudança.
3. **`pool_pre_ping=True`:** o banco gratuito dorme sem uso e derruba conexões antigas; o SQLAlchemy testa a conexão antes de usar.
4. **Local não muda:** sem `DATABASE_URL` de Postgres, tudo segue no SQLite.

### D2 — Cadastro só para convidados
1. **Configurações novas (`core/config.py`):** `invite_code` (vazio = cadastro livre) e `max_users` (0 = sem limite).
2. **Schema:** `UserCreate` ganhou `codigo_convite` (opcional, até 64 caracteres).
3. **Regra em `POST /auth/register`:** se há `INVITE_CODE` e o código não confere → **403**; se o total de contas já chegou em `MAX_USERS` → **403**. Só depois vem a checagem de e-mail duplicado.
4. **`hmac.compare_digest`:** compara o código em tempo constante.
5. **Aviso no startup:** em produção sem `INVITE_CODE`, a API registra um alerta no log.
6. **O código nunca fica em arquivo:** ele entra como variável de ambiente no painel do Render.

### D3 — Frontend pronto para produção
1. **`vercel.json`:** rewrite de tudo para `index.html`. Sem isso, recarregar `/jogo` na Vercel daria 404.
2. **Campo "Código de convite"** no cadastro, visível quando `VITE_EXIGE_CONVITE=true`. A flag só controla a tela; quem confere é a API.
3. **`useAvisoDemora`:** se o login ou o cadastro passa de 4 segundos, aparece "O servidor estava dormindo e está acordando…". O Render grátis leva até ~1 minuto no primeiro acesso.

## Testes
- `tests/test_convite.py` (10 novos): cadastro livre sem convite configurado; convite certo, com espaços, errado e ausente; convite errado não cria usuário; teto de contas recusa a próxima; teto não impede login; URL de Postgres ganha o driver; URL de SQLite não muda.
- `conftest.py`: fixture que zera convite e teto, para os testes não dependerem do `.env` da máquina.

## Verificação
| Checagem | Resultado |
|---|---|
| `pytest` | 84 passaram |
| `npm test` / `npm run lint` / `npm run build` | 26 passaram, sem avisos, build ok |
| API em modo produção contra **Postgres real** (contêiner Docker `postgres:17-alpine`) | `/health/db` conectado; sem convite 403; convite errado 403; convite certo 201; 3ª conta com teto 2 → 403; login, salvar pontos e ranking funcionando |

**Não verificado ainda:** o campo de convite e o aviso de demora não foram vistos no navegador (só no build), e nada foi testado no Neon, Render ou Vercel de verdade. Isso fica para as etapas D4 e D5.

## Próximo passo
Etapa D4: criar os serviços no Neon, Render e Vercel e preencher as variáveis de ambiente.
