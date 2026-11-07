# Etapa 10 — Polimento e segurança

**Objetivo:** revisar a segurança, endurecer o que faltava, deixar a documentação pronta para mostrar.
**Resultado:** CORS mínimo, barreira contra `SECRET_KEY` fraca em produção, auditoria de dependências, README final com diagrama do fluxo JWT, `docs/seguranca.md`. Backend com **74 testes**.

## Conceitos novos
| Conceito | Analogia |
|---|---|
| **Princípio do menor privilégio** | dar a chave só da porta que a pessoa precisa, não o molho inteiro |
| **Fail fast** | preferir não ligar a ligar inseguro |
| **Auditoria de dependências** | conferir se as peças compradas de terceiros têm defeito de fábrica conhecido |
| **Superfície de ataque** | tudo que está exposto e poderia ser usado contra você |

## Passo a passo (o que foi feito e como)

### 1. Revisão de código (busca por riscos)
Procurei por `print`, `logging`, `console.log`, `dangerouslySetInnerHTML`, `eval` e `localStorage` em `backend/app` e `frontend/src`. Não há log de token nem HTML injetado. O único `localStorage` é o do refresh token (decisão registrada, risco documentado).

### 2. Auditoria de dependências
- `pip-audit -r requirements.txt` → **No known vulnerabilities found**.
- `npm audit --omit=dev` → **0 vulnerabilities**.
(`pip-audit` foi instalado só na venv local; não entrou no `requirements.txt`.)

### 3. Barreira contra `SECRET_KEY` fraca (`core/config.py`, `main.py`)
- Novas configurações: `ENVIRONMENT` (`dev` ou `production`).
- `segredo_fraco()`: chave com menos de 32 caracteres ou ainda com o valor de exemplo (`troque...`, `dev-only...`).
- `validar_segredo()` roda no **startup** (lifespan): em `production` levanta `RuntimeError` e a API **não sobe**; em `dev`, só avisa no log.
- Por quê: com a chave padrão (que está no código-fonte público) qualquer pessoa forjaria tokens válidos.
- Verificado de verdade: `ENVIRONMENT=production SECRET_KEY=curta` → `RuntimeError: SECRET_KEY fraca ou padrão...`.

### 4. CORS no mínimo necessário (`main.py`)
Antes: `allow_methods=["*"]`, `allow_headers=["*"]`, `allow_credentials=True`. Agora:
- uma origem (`FRONTEND_ORIGIN`);
- métodos `GET` e `POST`;
- cabeçalhos `Authorization` e `Content-Type`;
- **sem credenciais** (o token vai no cabeçalho, não em cookie, então não precisa).

Verificado: preflight do front → 200 só com os cabeçalhos certos; preflight de `DELETE` → **400 "Disallowed CORS method"**; no navegador, um `PATCH` com cabeçalho extra foi **bloqueado**.

### 5. Testes novos
`test_config.py` (5): chave curta/exemplo é fraca; chave longa é forte; produção + fraca recusa; produção + forte sobe; dev + fraca só avisa.
`test_cors.py` (+3): método não usado é recusado; cabeçalho não usado é recusado; sem `allow-credentials`.
Total do backend: **74**.

### 6. Documentação final
- `README.md` refeito: o que tem, **diagrama de sequência do fluxo JWT** (Mermaid), como rodar, estrutura, índice dos docs e limites.
- `docs/seguranca.md`: 16 defesas com onde/como foram verificadas e uma tabela de **riscos que restam** com a solução de cada um.

### 7. Verificação final
| Checagem | Resultado |
|---|---|
| `pytest` | 74 passaram |
| `npm test` | 26 passaram |
| `npm run build` e `npm run lint` | ok, sem avisos |
| `pip-audit` / `npm audit` | 0 vulnerabilidades |
| Produção com chave fraca | API recusa subir |
| CORS no navegador | método/cabeçalho fora da lista bloqueados |

## Incidente durante a verificação (para ficar registrado)
Um servidor de teste antigo continuou vivo na porta 8000 e respondeu o primeiro `curl` com os cabeçalhos CORS **antigos**, o que parecia indicar que a mudança não tinha efeito. A causa era o processo velho, não o código. Resolvido encerrando os processos e subindo um servidor limpo, que respondeu com os cabeçalhos novos. Lição: antes de concluir que "o código não mudou o comportamento", confira **qual processo** está respondendo.

## Fora do que foi feito (de propósito)
- **Docker/deploy**: era opcional no plano e não foi feito.
- **Prints e GIF no README**: não foram incluídos (precisam ser capturados por você, no seu monitor).
- **Nota no diário `minha-progamacao/`**: não foi escrita por mim. O diário registra o que **você** estudou e mostrou; o conteúdo do projeto está em `docs/etapas/` para você levar para lá no seu ritmo, com o status 🆕 ou ⚠️ até você dominar.

## Para a entrevista
- O que você fez para proteger a API além do JWT? (hash, rate limit, CORS mínimo, erros genéricos, chave forte obrigatória em produção, auditoria)
- Por que a API recusa subir em produção com chave fraca? (fail fast: melhor falhar do que rodar insegura)
- Por que remover `allow_credentials` e limitar métodos e cabeçalhos do CORS? (menor privilégio)
- Quais riscos você conhece no seu próprio projeto? (veja a tabela de riscos que restam)

## Projeto concluído
Todas as etapas (0 a 10) estão feitas, documentadas e commitadas. Para treinar a fala: *"Léo, me entreviste sobre o api_cadastro"*.
