# Etapa 8 — Mini jogo da bolinha 🎮

**Objetivo:** criar um Breakout (bola, raquete e tijolos) em `<canvas>`, bonito e sem biblioteca de jogo.
**Resultado:** jogo completo com vidas, níveis, pontuação, pausa, partículas e rastro. Lógica separada do desenho e coberta por **26 testes**.

## Conceitos novos
| Conceito | Analogia |
|---|---|
| **Game loop** | o "coração" do jogo: a cada quadro atualiza o mundo e redesenha |
| **`requestAnimationFrame`** | o navegador avisa "pode desenhar o próximo quadro" (~60×/s, sincronizado com a tela) |
| **Delta time (`dt`)** | em vez de "andar 5 px por quadro", "andar 300 px **por segundo**": mesma velocidade em 60 Hz ou 144 Hz |
| **Colisão círculo × retângulo** | achar o ponto do retângulo mais perto da bola e ver se a distância é menor que o raio |
| **Sub-passos** | dividir um quadro em pedaços pequenos para a bola rápida não "atravessar" o tijolo (*tunneling*) |
| **`useRef`** | caixinha que guarda valor entre renders **sem** re-renderizar ao mudar |

## Arquitetura (3 camadas)
```
game/engine.js   ← regras e física (PURA: só números, sem React nem canvas)  → testável
game/render.js   ← desenha o estado no canvas (só lê, nunca altera)
components/Game.jsx ← liga tudo: loop, eventos, HUD e overlays em React
```
Separar assim permite testar as regras sem navegador e trocar o visual sem mexer na física.

## Passo a passo (o que foi feito e como)

### 1. Motor (`game/engine.js`)
- **Mundo lógico fixo de 800×500**; o canvas apenas escala. Assim a física é igual em qualquer tela.
- **Estado** (`criarJogo`): `status` (`ready | playing | paused | over`), `score`, `lives` (3), `level`, `speed`, `paddle`, `ball`, `bricks` (6 fileiras × 10), `particles`, `trail`.
- **Passo (`passo(g, dt, input)`)**: limita `dt` a 1/30 s (aba parada não "teleporta" a bola), atualiza efeitos, move a raquete e a bola.
- **Sub-passos**: `n = ceil(distância / (raio × 0.6))`: a bola nunca anda mais que ~60 % do raio por sub-passo, então não atravessa tijolos.
- **Paredes**: reflete o componente da velocidade (`Math.abs`/`-Math.abs`) em vez de só inverter o sinal, para a bola não "prender" na parede.
- **Raquete**: o ângulo de saída depende de **onde** a bola bate (centro = reto; pontas = até 60°). Dá controle ao jogador.
- **Tijolos**: `colisaoCirculoRetangulo` devolve a normal da batida; reflete no eixo dominante e **empurra a bola para fora** do tijolo. Só um tijolo por sub-passo (evita dupla batida em cantos).
- **Pontos**: `10 × (6 − fileira)`: fileiras de cima valem mais (60 … 10).
- **Dificuldade crescente**: a bola acelera 1,2 % a cada tijolo (teto de 760 px/s) e cada nível começa 40 px/s mais rápido.
- **Vidas**: bola cai → perde vida e volta à raquete; zero vidas → `over`. Limpar todos os tijolos → próximo nível.

### 2. Desenho (`game/render.js`)
Grade sutil, tijolos com gradiente e brilho (`shadowBlur`) em tons do violeta ao ciano, raquete com gradiente, bola com gradiente radial e brilho (pulsa enquanto espera o lançamento), **rastro** que some e **partículas** nas batidas.

### 3. Componente (`components/Game.jsx`)
- O estado do jogo vive em `useRef` (muda 60×/s **sem** re-renderizar o React).
- O **placar (HUD)** só vira estado do React quando score, vidas, nível ou status **mudam**.
- `useEffect` liga o loop e os eventos e **limpa tudo ao desmontar** (`cancelAnimationFrame` + `removeEventListener`).
- Canvas nítido em telas retina: tamanho real × `devicePixelRatio`.
- Controles: **mouse/toque** (converte a posição da tela para a coordenada do jogo), **← → / A D**, **Espaço** lança/pausa/retoma/recomeça, **P** pausa. Clique não pausa durante o jogo (seria fácil pausar sem querer).
- **Pausa automática** ao trocar de aba ou perder o foco da janela.
- Overlays em HTML (Pronto?, Pausado, Fim de jogo) com botão, e corações de vida em SVG.
- `onGameOver(score)` avisa a página **uma vez** ao fim da partida: a Etapa 9 usa isso para salvar a pontuação.
- Teclas: usa `e.code` e, se ausente, cai para `e.key` (foi necessário no teste automatizado).

### 4. Testes do motor (Vitest, 26)
`npm test` roda `src/game/engine.test.js`:
- colisão círculo × retângulo (longe, por cima, lateral, centro dentro);
- estado inicial, lançamento, pausa congela, limites da raquete, teclado;
- rebote em parede/teto, raquete (centro reto, pontas inclinadas);
- tijolo quebra e soma pontos, fileira de cima vale mais, aceleração com teto, **sem tunneling a 760 px/s**, subida de nível;
- vida perdida, game over, bola parada depois do fim;
- `dt` gigante não teleporta, partículas nascem e somem.

Um teste falhou na primeira rodada: o cenário "fileira de cima" fazia a bola passar por outros tijolos. Era erro do **teste** (montagem do cenário), não do motor; corrigi removendo os outros tijolos do caminho.

### 5. Verificação (no navegador, com o backend real)
| Cenário | Resultado |
|---|---|
| Sessão restaurada e `/jogo` abre com o jogo | ok |
| Espaço lança a bola; tijolo quebrado soma pontos (10, 70…) | ok |
| Bola cai: perde coração e volta a "Pronto?" | ok |
| `P` pausa ("Pausado") e `P` retoma | ok |
| 3 vidas perdidas: "Fim de jogo, você fez 70 pontos" | ok |
| Espaço no fim de jogo recomeça | ok |
| Sair da tela do jogo: chamadas de `requestAnimationFrame` depois de sair | **0** (loop encerrado) |
| `npm run build`, `npm run lint`, `npm test` | ok (26 testes) |

Observação: não joguei uma partida completa com a raquete movimentada (mouse) nem vi o rastro e as partículas em movimento; a verificação foi por capturas de tela, teclas e testes do motor.

## Decisões
- **Motor puro e testável** em vez de lógica espalhada no componente.
- **Canvas puro** (sem Phaser): o objetivo é aprender o loop, a colisão e o `dt`.
- **HUD e overlays em HTML**, não no canvas: texto nítido, acessível e estilizável com Tailwind.
- **Vitest** só para o motor (o que tem lógica densa); telas ficam com verificação manual.

## Limites conscientes
- Sem som, sem power-ups, tijolos de uma só vida.
- O lançamento tem desvio aleatório pequeno; testes injetam o `rng` para ficarem determinísticos.
- Pontuação ainda **não é salva**: Etapa 9.

## Próximo passo
Etapa 9: placar ligado ao JWT (`POST /scores`, ranking `GET /scores/top`).
