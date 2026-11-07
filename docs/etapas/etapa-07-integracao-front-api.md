# Etapa 7 — Integrar front com a API

**Objetivo:** as telas passarem a falar com a API de verdade, manter o usuário logado e proteger o `/jogo`.
**Resultado:** cadastro, login, restauração de sessão ao recarregar, renovação automática do access token, rota protegida e logout, tudo testado no navegador contra o backend real.

## Conceitos novos
| Conceito | Analogia |
|---|---|
| **Interceptor** | um fiscal na porta: toda requisição que sai e toda resposta que chega passam por ele |
| **Context API** | um quadro de avisos que qualquer componente lê sem precisar receber por props |
| **Rota protegida** | catraca do front (UX), enquanto a catraca real é a API |
| **Single-flight** | se 5 pessoas pedem a mesma coisa ao mesmo tempo, faz-se **um** pedido só |
| **XSS** | script malicioso injetado na página que lê o que o JavaScript consegue ler |
| **CSRF** | outro site faz o navegador enviar uma requisição usando seus cookies |

## Passo a passo (o que foi feito e como)

### 1. Onde guardar os tokens (`auth/tokenStore.js`)
Decisão registrada em [decisoes.md #14](../decisoes.md):
- **access token** (15 min) → só em **memória** (variável). Some ao recarregar.
- **refresh token** (7 dias) → `localStorage`, para continuar logado ao recarregar.

| Opção | Risco principal | Observação |
|---|---|---|
| Memória | perde ao recarregar | seguro contra leitura persistente |
| `localStorage` | **XSS** lê o token | simples; usado só para o refresh |
| Cookie `httpOnly` | **CSRF** (mitigável com `SameSite`) | JS não lê o cookie; exigiria mudar a API para setar o cookie |

Combinação escolhida: o token mais poderoso por mais tempo (refresh) ainda fica exposto a XSS. Para um projeto de estudo é aceitável e **vira o primeiro item de "o que melhoraria"** (refresh em cookie `httpOnly` + `SameSite`).

### 2. Cliente HTTP com interceptors (`api/client.js`)
- **Requisição:** se existe access token, anexa `Authorization: Bearer <access>`.
- **Resposta 401** (e não for rota `/auth/*`, e ainda não tentou antes):
  1. pede um novo access com o refresh (`POST /auth/refresh`);
  2. **repete** a requisição original com o token novo;
  3. se a renovação falhar: limpa tokens e avisa o app (`aoPerderSessao`), que volta para anônimo.
- **Rotas `/auth/*` ficam de fora:** um login com senha errada também devolve 401 e **não** deve disparar renovação.
- A renovação usa `axios` puro (sem interceptors) para não entrar em loop se o próprio refresh der 401.
- **Single-flight:** várias requisições com 401 ao mesmo tempo compartilham **uma** renovação (`renovando`). Foi visto no navegador: 2 chamadas a `/users/me` com 401 → **1** `POST /auth/refresh` → 2 retentativas com 200.

### 3. Funções da API (`api/auth.js`) e erros amigáveis (`api/errors.js`)
`registrar`, `entrar`, `buscarMe`. `mensagemDeErro` traduz o erro do Axios: sem resposta → "Não foi possível conectar ao servidor"; `detail` do backend (401, 409, 429) vira a mensagem; 422 → "Confira os dados informados".

### 4. `AuthContext` + `useAuth`
- Estado: `user` e `status` (`carregando` | `autenticado` | `anonimo`).
- **Ao abrir o app:** se há refresh token, chama `/users/me`. Sem access em memória a chamada leva 401, o interceptor renova sozinho e repete, e a sessão é restaurada sem código extra.
- `login`: chama `/auth/login`, guarda os tokens, busca o usuário. `logout`: limpa tudo.
- Separei em 3 arquivos (`context.js`, `AuthContext.jsx` com o Provider, `useAuth.js`) porque o Fast Refresh do React só funciona bem em arquivos que exportam apenas componentes (o lint avisou).

### 5. Rotas protegidas (`auth/ProtectedRoute.jsx`)
- `ProtectedRoute`: `carregando` → spinner; `anonimo` → `/login` guardando a página pretendida em `state.from`; autenticado → renderiza (`<Outlet />`).
- `GuestRoute`: quem já está logado é mandado ao `/jogo` (não precisa ver login/cadastro).
- Depois do login, volta para a página que tentou abrir ou vai ao jogo.

### 6. Telas
`Login` e `Cadastro` trocaram o servidor simulado pela API real; `api/mock.js` foi **apagado**. `Jogo` mostra "Olá, {nome}" e o botão **Sair**.

### 7. Verificação (backend real + navegador)
| Cenário | Resultado |
|---|---|
| Abrir `/jogo` sem login | redireciona para `/login` (`state.from = /jogo`) |
| Cadastro real | cria o usuário e volta ao login com banner verde |
| Login com senha errada | "E-mail ou senha inválidos" (sem tentar renovar token) |
| Login correto | vai ao `/jogo`, mostra "Olá, Matheus" |
| Recarregar `/jogo` | continua logado (refresh → novo access → retry) |
| `localStorage` | só a chave `rebote.refresh_token` (access não fica lá) |
| Logado abrindo `/login` | redireciona para `/jogo` |
| Sair | limpa o `localStorage`; `/jogo` volta a redirecionar para o login |
| `npm run build` / `npm run lint` | ok, sem avisos |

## Limites conscientes
- Refresh token em `localStorage` (XSS), sem rotação nem revogação no servidor.
- Se o refresh expirar com a aba aberta, o usuário só descobre na próxima requisição protegida.
- Sem sincronização de logout entre abas.
- A proteção do `/jogo` no front é só UX; os dados são protegidos pela API.

## Próximo passo
Etapa 8: o mini jogo da bolinha (canvas, `requestAnimationFrame`, colisão).
