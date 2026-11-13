# Etapa 12 — Deploy no ar (D4 e D5)

**Objetivo:** colocar o Rebote na internet para até 5 pessoas, sem custo.
**Resultado:** site na Vercel, API no Render e banco no Neon, conversando entre si. Plano: [PLANO-DEPLOY.md](../../PLANO-DEPLOY.md).

## Passo a passo
1. **Neon:** projeto `rebote` (Postgres, região AWS us-east-2). A *connection string* tem a senha do banco, então só vai para o painel do Render.
2. **Vercel:** projeto importado do GitHub com raiz `frontend` e variáveis `VITE_API_URL` e `VITE_EXIGE_CONVITE=true`. Variáveis `VITE_*` entram no build: mudou o valor, precisa de novo deploy.
3. **Render:** em vez de preencher o formulário de serviço na mão, o `render.yaml` (Blueprint) descreve a API. Segredos ficam com `sync: false` (o Render pergunta no painel) ou `generateValue: true` (o Render sorteia). O repositório é público, então nada secreto pode estar no arquivo.
4. **Região:** API e banco na mesma região (Ohio / us-east-2) para a conversa ser rápida.

## Verificação em produção
| Checagem | Resultado |
|---|---|
| `/health` e `/health/db` na URL do Render | ok, banco conectado |
| Cadastro sem código de convite | 403 "Código de convite inválido" |
| Cadastro com código errado | 403 |
| CORS da origem da Vercel | liberada |
| CORS de origem estranha | recusada (400) |
| Site na Vercel, rota `/jogo` recarregando | 200 (rewrite funcionando) |
| Bundle do site aponta para `rebote-api.onrender.com` | sim |

Não criei conta de teste em produção para não gastar uma das 5 vagas.

## O que deu errado no caminho
- Primeiro deploy da Vercel ficou sem build porque a página foi trocada no meio do clique; um novo push disparou o build pela integração com o GitHub.
- Variáveis digitadas com a seção recolhida se perderam na Vercel; foram refeitas e conferidas.

## Falta
- Cadastro, login, partida e ranking feitos por uma pessoa de verdade, no PC e no celular.
- Render dorme após 15 min: o primeiro acesso demora cerca de 1 minuto (o site avisa).
