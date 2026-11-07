# Etapa 4 — Testes e segurança do back

**Objetivo:** blindar o backend: limite de tentativas de login, CORS comprovado por testes e suíte completa.
**Resultado:** login devolve 429 após 5 falhas; CORS testado; 51 testes passando.

## Conceitos novos
| Conceito | Analogia |
|---|---|
| **Força bruta** | alguém testando milhares de senhas até acertar |
| **Rate limit** | porteiro que barra quem erra a senha vezes demais |
| **Janela deslizante** | só contam as falhas dos últimos 60 segundos |
| **429 Too Many Requests** | "calma, volte mais tarde" (+ header `Retry-After`) |
| **CORS** | o navegador só deixa o site X chamar a API se a API disser que X pode |
| **Relógio falso (fake clock)** | teste controla o tempo sem esperar de verdade |

## O que a suíte já cobria (Etapas 2 e 3)
O item "pytest: cadastro ok, e-mail duplicado, login ok, senha errada, rota protegida com e sem token, token expirado" do plano já estava coberto nas etapas anteriores (cadastro, login, `/users/me` e refresh). Esta etapa acrescentou o que faltava.

## Passo a passo (o que foi feito e como)

### 1. Configuração
`config.py` ganhou `login_max_attempts=5` e `login_window_seconds=60`, também documentados em `.env.example`. Assim dá para ajustar sem mexer no código.

### 2. `core/rate_limit.py` — a classe `RateLimiter`
- Guarda, por **chave**, uma fila (`deque`) com o horário de cada falha.
- `register_failure(chave)`: anota a falha.
- `retry_after(chave)`: apaga falhas fora da janela; se ainda restam `>= max`, devolve quantos segundos faltam; senão `0` (liberado).
- `reset(chave)`: zera (usado no login com sucesso).
- O relógio é **injetável** (`clock=`), o que permite testar sem `sleep`.
- Instância global `login_limiter` criada com os valores do `settings`.

### 3. Uso no `POST /auth/login`
1. Chave = `IP|e-mail`.
2. Antes de qualquer coisa, `retry_after`: se bloqueado, **429** com `Retry-After`.
3. Falha de credencial → `register_failure`.
4. Sucesso → `reset`.

Um bloqueado não consegue entrar **nem com a senha certa** até a janela esvaziar; senão o atacante continuaria tentando pela mesma porta.

### 4. Testes
`test_rate_limit.py` (9):
- **Unidade (com relógio falso):** libera até o máximo e bloqueia; libera após a janela; chaves independentes; `reset`.
- **API:** 429 após 5 falhas com `Retry-After`; nem a senha certa passa enquanto bloqueado; sucesso zera as falhas; bloqueio de um e-mail não afeta outro.

`test_cors.py` (3): preflight (`OPTIONS`) da origem do front é liberado; origem `site-malicioso.com` não recebe `access-control-allow-origin`; resposta normal traz o header para a origem certa.

`conftest.py`: fixture `autouse` zera o limiter antes e depois de cada teste (ele vive em memória, então sem isso as falhas vazariam entre testes).

### 5. Verificação
| Checagem | Resultado |
|---|---|
| `pytest` | 51 passaram |
| Servidor real: 7 logins errados seguidos | tentativas 1–5 → 401; 6 e 7 → **429** com `retry-after: 60` |

## O que o CORS protege (e o que não)
- **Protege:** que uma página de **outro site** aberta no navegador do usuário leia respostas da sua API usando o login dele.
- **Não protege:** a API contra `curl`, scripts ou Postman. CORS é regra do **navegador**, não do servidor. Quem protege a API é a autenticação.

## Limites conscientes
- Limiter **em memória**: zera ao reiniciar e não é compartilhado entre vários processos. Produção: Redis ou proxy/WAF.
- Chave `IP|e-mail`: quem testa muitos e-mails diferentes do mesmo IP não é barrado por este limite. Um limite extra por IP seria o próximo passo.
- Atrás de proxy reverso o IP visto seria o do proxy (precisaria ler `X-Forwarded-For` de proxy confiável).
- `register` e `refresh` ainda sem limite.

## Próximo passo
Etapa 5: frontend base e design system (Tailwind, componentes, rotas).
