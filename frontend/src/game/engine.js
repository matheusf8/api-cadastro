// Motor do jogo (Breakout). LÓGICA PURA: não conhece React nem canvas, só números.
// Isso permite testar sem navegador e trocar o desenho sem mexer nas regras.
//
// Coordenadas lógicas fixas: 800 x 500. O canvas escala isso para qualquer tela.
// Tempo: tudo é multiplicado por `dt` (segundos desde o último quadro), para o jogo ter a
// MESMA velocidade em monitor de 60 Hz ou 144 Hz.

export const W = 800
export const H = 500

const PADDLE_W = 110
const PADDLE_H = 14
const PADDLE_Y = H - 36
const PADDLE_SPEED = 700 // px/s com teclado
const MAX_BOUNCE_ANGLE = Math.PI / 3 // 60° nas pontas da raquete

const BALL_R = 8
const LIVES = 3

const COLS = 10
const ROWS = 6
const GAP = 6
const TOP = 60
const SIDE = 24
const BRICK_W = (W - SIDE * 2 - GAP * (COLS - 1)) / COLS
const BRICK_H = 22

const BASE_SPEED = 360 // px/s no nível 1
const SPEED_PER_LEVEL = 40
const SPEED_PER_HIT = 1.012 // a bola acelera um pouco a cada tijolo
const MAX_SPEED = 760

const clamp = (v, min, max) => Math.min(Math.max(v, min), max)
export const velocidadeBase = (nivel) => Math.min(BASE_SPEED + (nivel - 1) * SPEED_PER_LEVEL, MAX_SPEED)

function criarTijolos() {
  const tijolos = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      tijolos.push({
        x: SIDE + col * (BRICK_W + GAP),
        y: TOP + row * (BRICK_H + GAP),
        w: BRICK_W,
        h: BRICK_H,
        row,
        hue: 265 - (row / (ROWS - 1)) * 75, // violeta no topo -> ciano embaixo
        alive: true,
      })
    }
  }
  return tijolos
}

function bolaNaRaquete(g) {
  g.ball.x = g.paddle.x
  g.ball.y = g.paddle.y - g.ball.r
  g.ball.vx = 0
  g.ball.vy = 0
}

export function criarJogo() {
  const g = {
    status: 'ready', // ready | playing | paused | over
    score: 0,
    lives: LIVES,
    level: 1,
    speed: velocidadeBase(1),
    paddle: { x: W / 2, y: PADDLE_Y, w: PADDLE_W, h: PADDLE_H },
    ball: { x: W / 2, y: PADDLE_Y - BALL_R, vx: 0, vy: 0, r: BALL_R },
    bricks: criarTijolos(),
    bricksLeft: COLS * ROWS,
    particles: [],
    trail: [],
  }
  bolaNaRaquete(g)
  return g
}

// ---------------------------------------------------------------- ações do jogador

export function lancar(g, rng = Math.random) {
  if (g.status !== 'ready') return
  const angulo = (rng() - 0.5) * 0.6 // leve desvio da vertical
  g.ball.vx = g.speed * Math.sin(angulo)
  g.ball.vy = -g.speed * Math.cos(angulo)
  g.status = 'playing'
}

export function alternarPausa(g) {
  if (g.status === 'playing') g.status = 'paused'
  else if (g.status === 'paused') g.status = 'playing'
}

// ---------------------------------------------------------------- colisão

// Círculo x retângulo. Devolve a normal da batida (apontando do retângulo para a bola)
// e quanto a bola entrou, ou null se não encostou.
export function colisaoCirculoRetangulo(bola, r) {
  const px = clamp(bola.x, r.x, r.x + r.w) // ponto do retângulo mais perto da bola
  const py = clamp(bola.y, r.y, r.y + r.h)
  const dx = bola.x - px
  const dy = bola.y - py
  const d2 = dx * dx + dy * dy
  if (d2 > bola.r * bola.r) return null

  if (d2 === 0) {
    // Centro da bola DENTRO do retângulo: sai pelo lado mais perto.
    const esq = bola.x - r.x
    const dir = r.x + r.w - bola.x
    const cima = bola.y - r.y
    const baixo = r.y + r.h - bola.y
    const m = Math.min(esq, dir, cima, baixo)
    if (m === esq) return { nx: -1, ny: 0, entrada: bola.r + esq }
    if (m === dir) return { nx: 1, ny: 0, entrada: bola.r + dir }
    if (m === cima) return { nx: 0, ny: -1, entrada: bola.r + cima }
    return { nx: 0, ny: 1, entrada: bola.r + baixo }
  }
  const d = Math.sqrt(d2)
  return { nx: dx / d, ny: dy / d, entrada: bola.r - d }
}

function ajustaVelocidade(g) {
  const s = Math.hypot(g.ball.vx, g.ball.vy)
  if (s === 0) return
  const k = g.speed / s
  g.ball.vx *= k
  g.ball.vy *= k
}

function faiscas(g, tijolo) {
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2
    const v = 80 + Math.random() * 180
    g.particles.push({
      x: tijolo.x + tijolo.w / 2,
      y: tijolo.y + tijolo.h / 2,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 60,
      life: 0.5 + Math.random() * 0.3,
      max: 0.8,
      hue: tijolo.hue,
      size: 2 + Math.random() * 2.5,
    })
  }
}

function proximoNivel(g) {
  g.level++
  g.speed = velocidadeBase(g.level)
  g.bricks = criarTijolos()
  g.bricksLeft = COLS * ROWS
  g.status = 'ready'
  bolaNaRaquete(g)
}

function perderVida(g) {
  g.lives--
  g.speed = velocidadeBase(g.level)
  if (g.lives <= 0) {
    g.status = 'over'
    return
  }
  g.status = 'ready'
  bolaNaRaquete(g)
}

// ---------------------------------------------------------------- um passo de física

function passoDaBola(g, dt) {
  const b = g.ball
  b.x += b.vx * dt
  b.y += b.vy * dt

  // paredes (esquerda, direita, teto)
  if (b.x < b.r) {
    b.x = b.r
    b.vx = Math.abs(b.vx)
  } else if (b.x > W - b.r) {
    b.x = W - b.r
    b.vx = -Math.abs(b.vx)
  }
  if (b.y < b.r) {
    b.y = b.r
    b.vy = Math.abs(b.vy)
  }

  // raquete: o ângulo de saída depende de ONDE a bola bate (centro = reto, ponta = inclinado)
  const p = g.paddle
  const metade = p.w / 2
  if (
    b.vy > 0 &&
    b.y + b.r >= p.y &&
    b.y < p.y + p.h &&
    b.x >= p.x - metade - b.r &&
    b.x <= p.x + metade + b.r
  ) {
    const rel = clamp((b.x - p.x) / metade, -1, 1)
    const ang = rel * MAX_BOUNCE_ANGLE
    b.y = p.y - b.r
    b.vx = g.speed * Math.sin(ang)
    b.vy = -g.speed * Math.cos(ang)
  }

  // tijolos (no máximo um por passo, evita "dupla batida" e bugs de canto)
  for (const t of g.bricks) {
    if (!t.alive) continue
    const hit = colisaoCirculoRetangulo(b, t)
    if (!hit) continue

    t.alive = false
    g.bricksLeft--
    g.score += 10 * (ROWS - t.row) // as fileiras de cima valem mais
    g.speed = Math.min(g.speed * SPEED_PER_HIT, MAX_SPEED)

    // reflete no eixo dominante da batida e empurra a bola para fora do tijolo
    if (Math.abs(hit.nx) > Math.abs(hit.ny)) b.vx = Math.abs(b.vx) * Math.sign(hit.nx || 1)
    else b.vy = Math.abs(b.vy) * Math.sign(hit.ny || 1)
    b.x += hit.nx * hit.entrada
    b.y += hit.ny * hit.entrada
    ajustaVelocidade(g)

    faiscas(g, t)
    if (g.bricksLeft === 0) proximoNivel(g)
    return
  }

  // caiu pelo fundo
  if (b.y - b.r > H) perderVida(g)
}

function moverRaquete(g, dt, input) {
  const p = g.paddle
  if (input.pointerX != null) p.x = input.pointerX
  else if (input.dir) p.x += input.dir * PADDLE_SPEED * dt
  p.x = clamp(p.x, p.w / 2, W - p.w / 2)
}

function atualizaEfeitos(g, dt) {
  for (const f of g.particles) {
    f.life -= dt
    f.x += f.vx * dt
    f.y += f.vy * dt
    f.vy += 420 * dt // gravidade
  }
  g.particles = g.particles.filter((f) => f.life > 0)

  // rastro da bola: guarda as últimas posições; some devagar quando a bola para
  if (g.status === 'playing') {
    g.trail.push({ x: g.ball.x, y: g.ball.y })
    if (g.trail.length > 14) g.trail.shift()
  } else if (g.trail.length) {
    g.trail.shift()
  }
}

// `input` = { pointerX: número|null, dir: -1|0|1 }
export function passo(g, dtBruto, input) {
  // Limita o dt: se a aba ficou parada, não "teleporta" a bola ao voltar.
  const dt = Math.min(dtBruto, 1 / 30)

  atualizaEfeitos(g, dt)
  if (g.status === 'paused' || g.status === 'over') return

  moverRaquete(g, dt, input)
  if (g.status === 'ready') {
    bolaNaRaquete(g)
    return
  }

  // Sub-passos: impede a bola rápida de "atravessar" um tijolo entre dois quadros.
  const distancia = g.speed * dt
  const n = Math.max(1, Math.ceil(distancia / (g.ball.r * 0.6)))
  for (let i = 0; i < n && g.status === 'playing'; i++) passoDaBola(g, dt / n)
}
