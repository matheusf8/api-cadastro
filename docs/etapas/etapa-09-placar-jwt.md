# Etapa 9 — Placar ligado ao JWT

**Objetivo:** salvar a pontuação de cada partida por usuário e mostrar ranking e recorde pessoal, provando que o JWT identifica **quem** está jogando.
**Resultado:** `POST /scores`, `GET /scores/top`, `GET /scores/me` (todos protegidos) e painel de ranking ao lado do jogo. Backend com **66 testes**.

## Conceitos novos
| Conceito | Analogia |
|---|---|
| **Chave estrangeira (FK)** | a "etiqueta com o nome do dono" colada em cada pontuação (`user_id`) |
| **Relacionamento 1:N** | um usuário tem várias pontuações |
| **`GROUP BY` + `MAX`** | "de cada jogador, só o melhor resultado" |
| **Cascata (`ON DELETE CASCADE`)** | apagou o usuário, apagam-se as pontuações dele |
| **Dependência no router** | catraca única na entrada de **todas** as rotas do grupo |
| **Confiar no token, não no corpo** | o crachá diz quem você é; o que você *fala* na requisição, não |

## Passo a passo (o que foi feito e como)

### 1. Modelo `Score` (`models.py`)
| Coluna | Detalhe |
|---|---|
| `id` | chave primária |
| `user_id` | `ForeignKey("users.id", ondelete="CASCADE")`, **indexada** |
| `pontos` | inteiro, **indexado** (o ranking ordena por ele) |
| `criado_em` | data/hora em UTC |

No `User`, `scores = relationship(..., cascade="all, delete-orphan")`: apagar o usuário apaga as pontuações no nível do ORM também. A tabela nova é criada pelo `create_all` ao subir a API; o banco antigo ganha a tabela sem perder usuários.

### 2. Schemas (`schemas.py`)
- `ScoreCreate`: **só** `pontos` (inteiro, `0 ≤ pontos ≤ 200 000`). **Não tem `user_id`.**
- `ScoreOut`, `MeusPontos {recorde, partidas}`.
- `RankingItem {posicao, nome, pontos, voce}`: só o **nome**, nunca o e-mail (privacidade). `voce` marca a linha do próprio usuário.

### 3. Rotas (`routers/scores.py`)
O router foi criado com `dependencies=[Depends(get_current_user)]`: a catraca vale para as três rotas sem repetir.

| Rota | O que faz |
|---|---|
| `POST /scores` | cria `Score(user_id=<usuário do TOKEN>, pontos=...)`. 201 |
| `GET /scores/top` | top 10: `SELECT user.id, nome, MAX(pontos) ... GROUP BY user.id ORDER BY MAX desc, nome LIMIT 10` (**um jogador aparece uma vez**, com o melhor resultado) |
| `GET /scores/me` | `COALESCE(MAX(pontos), 0)` e `COUNT(*)` do usuário logado |

**Ponto-chave de segurança:** o dono da pontuação vem de `user.id` (do JWT). Se a API aceitasse `user_id` no corpo, qualquer um salvaria pontos em nome de outra pessoa. Teste prova: enviar `{"pontos": 50, "user_id": <outro>}` salva para o dono do token.

### 4. Testes (`tests/test_scores.py`, 15)
- as 3 rotas dão 401 sem token; **refresh token não abre** as rotas;
- salva para o usuário do token; `user_id` no corpo é **ignorado**;
- 422 para pontos negativos, absurdos, texto ou ausentes; 0 é aceito;
- `/me`: zeros sem partidas, recorde e contagem corretos, isolado por usuário;
- ranking: vazio, ordem e posição, **só o melhor de cada jogador**, **sem e-mail**, limite de 10, flag `voce`;
- apagar usuário apaga as pontuações.

### 5. Frontend
- `api/scores.js`: `salvarPontuacao`, `buscarRanking`, `buscarMeusPontos` (o interceptor já anexa o token e renova se preciso).
- `components/Ranking.jsx`: recorde, partidas e top 10 com medalhas 🥇🥈🥉; linha do usuário destacada ("você"); estados de carregando, vazio e erro.
- `Game` ganhou a prop `fimExtra`: texto extra na tela de fim de jogo.
- `pages/Jogo.jsx`: duas colunas (jogo + painel). Carrega o painel ao abrir; no fim da partida (`onGameOver`) **salva a pontuação** e recarrega ranking e recorde. Mostra "🏆 Novo recorde!" ou "Seu recorde: N". Partida com 0 ponto não é salva.
- A primeira carga usa o padrão `useEffect` com flag `vivo`, que evita atualizar estado depois da tela fechada (e satisfez a regra de lint `set-state-in-effect`).

### 6. Verificação (backend real + navegador)
| Cenário | Resultado |
|---|---|
| Ranking com 2 jogadores semeados (420 e 180) | aparece com 🥇 e 🥈 |
| Usuário novo | recorde 0, partidas 0 |
| Partida até o fim de jogo (100 pontos) | tela mostra "🏆 Novo recorde!" |
| Rede | `POST /scores` 201, depois `GET /scores/top` e `/scores/me` 200 |
| Painel depois da partida | "Seu recorde 100", "Partidas 1", Jogo em 3º com "você" |
| `pytest` / `npm test` / `npm run build` / `npm run lint` | 66 / 26 / ok / sem avisos |

## Limite importante (honesto)
O jogo roda **no navegador**, então o servidor **não consegue provar** que a pontuação é verdadeira: um usuário mal-intencionado pode chamar `POST /scores` com qualquer valor até o teto (200 000). O teto só barra absurdos. Para um ranking confiável seria preciso **simular a partida no servidor** (ou enviar o registro das jogadas e validá-lo), o que foge do escopo de um projeto de estudo.

Outros limites: sem paginação nem filtro por período no ranking; empate no ranking desempata por nome.

## Próximo passo
Etapa 10: polimento, README final, revisão de segurança.
