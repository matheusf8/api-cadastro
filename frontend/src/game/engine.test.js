import { describe, expect, it } from 'vitest'
import {
  H,
  W,
  alternarPausa,
  colisaoCirculoRetangulo,
  criarJogo,
  lancar,
  passo,
  velocidadeBase,
} from './engine'

const SEM_INPUT = { pointerX: null, dir: 0 }
const DT = 1 / 60

// Joga N quadros de uma vez.
const rodar = (g, quadros, input = SEM_INPUT) => {
  for (let i = 0; i < quadros; i++) passo(g, DT, input)
}

// Coloca o jogo em andamento com a bola numa posição/velocidade controladas.
function emJogo({ x, y, vx, vy }) {
  const g = criarJogo()
  g.status = 'playing'
  Object.assign(g.ball, { x, y, vx, vy })
  return g
}

describe('colisaoCirculoRetangulo', () => {
  const ret = { x: 100, y: 100, w: 50, h: 20 }

  it('não colide quando está longe', () => {
    expect(colisaoCirculoRetangulo({ x: 10, y: 10, r: 8 }, ret)).toBeNull()
  })

  it('bate por cima: normal aponta para cima', () => {
    const hit = colisaoCirculoRetangulo({ x: 120, y: 94, r: 8 }, ret)
    expect(hit.ny).toBe(-1)
    expect(hit.nx).toBe(0)
  })

  it('bate pela lateral esquerda: normal aponta para a esquerda', () => {
    const hit = colisaoCirculoRetangulo({ x: 94, y: 110, r: 8 }, ret)
    expect(hit.nx).toBe(-1)
  })

  it('centro dentro do retângulo sai pelo lado mais próximo', () => {
    const hit = colisaoCirculoRetangulo({ x: 125, y: 102, r: 8 }, ret)
    expect(hit.ny).toBe(-1)
  })
})

describe('estado inicial e ações', () => {
  it('começa pronto, com 3 vidas, nível 1 e 60 tijolos', () => {
    const g = criarJogo()
    expect(g.status).toBe('ready')
    expect(g.lives).toBe(3)
    expect(g.level).toBe(1)
    expect(g.bricks).toHaveLength(60)
    expect(g.bricksLeft).toBe(60)
  })

  it('a bola acompanha a raquete antes do lançamento', () => {
    const g = criarJogo()
    passo(g, DT, { pointerX: 200, dir: 0 })
    expect(g.paddle.x).toBe(200)
    expect(g.ball.x).toBe(200)
  })

  it('lançar põe a bola para cima na velocidade do nível', () => {
    const g = criarJogo()
    lancar(g, () => 0.5) // sem desvio
    expect(g.status).toBe('playing')
    expect(g.ball.vy).toBeCloseTo(-velocidadeBase(1))
    expect(g.ball.vx).toBeCloseTo(0)
  })

  it('lançar só funciona no estado pronto', () => {
    const g = criarJogo()
    g.status = 'over'
    lancar(g)
    expect(g.status).toBe('over')
  })

  it('pausa congela a bola e retomar continua', () => {
    const g = criarJogo()
    lancar(g)
    rodar(g, 5)
    alternarPausa(g)
    expect(g.status).toBe('paused')

    const { x, y } = g.ball
    rodar(g, 30)
    expect(g.ball.x).toBe(x)
    expect(g.ball.y).toBe(y)

    alternarPausa(g)
    expect(g.status).toBe('playing')
  })

  it('a raquete respeita as bordas da tela', () => {
    const g = criarJogo()
    passo(g, DT, { pointerX: -500, dir: 0 })
    expect(g.paddle.x).toBe(g.paddle.w / 2)
    passo(g, DT, { pointerX: 5000, dir: 0 })
    expect(g.paddle.x).toBe(W - g.paddle.w / 2)
  })

  it('teclado move a raquete com a velocidade esperada', () => {
    const g = criarJogo()
    const antes = g.paddle.x
    passo(g, DT, { pointerX: null, dir: 1 })
    expect(g.paddle.x).toBeCloseTo(antes + 700 * DT)
  })
})

describe('paredes e raquete', () => {
  it('rebate na parede direita', () => {
    const g = emJogo({ x: W - 9, y: 300, vx: 300, vy: 0.001 })
    rodar(g, 3)
    expect(g.ball.vx).toBeLessThan(0)
  })

  it('rebate no teto', () => {
    const g = emJogo({ x: 400, y: 10, vx: 0.001, vy: -300 })
    rodar(g, 3)
    expect(g.ball.vy).toBeGreaterThan(0)
  })

  it('raquete devolve a bola para cima', () => {
    const g = emJogo({ x: 400, y: g_paddleY() - 20, vx: 0, vy: 300 })
    g.paddle.x = 400
    rodar(g, 20)
    expect(g.ball.vy).toBeLessThan(0)
  })

  it('bater na ponta direita inclina para a direita; na esquerda, para a esquerda', () => {
    const dir = emJogo({ x: 400 + 50, y: g_paddleY() - 10, vx: 0, vy: 300 })
    dir.paddle.x = 400
    rodar(dir, 10)
    expect(dir.ball.vx).toBeGreaterThan(0)

    const esq = emJogo({ x: 400 - 50, y: g_paddleY() - 10, vx: 0, vy: 300 })
    esq.paddle.x = 400
    rodar(esq, 10)
    expect(esq.ball.vx).toBeLessThan(0)
  })

  it('bater no centro sobe reto', () => {
    const g = emJogo({ x: 400, y: g_paddleY() - 10, vx: 0, vy: 300 })
    g.paddle.x = 400
    rodar(g, 10)
    expect(Math.abs(g.ball.vx)).toBeLessThan(1)
  })
})

function g_paddleY() {
  return criarJogo().paddle.y
}

describe('tijolos, pontos e níveis', () => {
  it('quebra o tijolo, soma pontos e a bola quica', () => {
    const g = criarJogo()
    const t = g.bricks[g.bricks.length - 1] // fileira de baixo (vale 10)
    g.status = 'playing'
    Object.assign(g.ball, { x: t.x + t.w / 2, y: t.y + t.h + 12, vx: 0, vy: -360 })

    rodar(g, 6)

    expect(t.alive).toBe(false)
    expect(g.score).toBe(10)
    expect(g.bricksLeft).toBe(59)
    expect(g.ball.vy).toBeGreaterThan(0) // quicou para baixo
  })

  it('tijolos de cima valem mais', () => {
    const g = criarJogo()
    const t = g.bricks[0] // fileira do topo (vale 60)
    // tira os outros tijolos do caminho: a bola nasce logo abaixo do topo
    g.bricks.forEach((b) => {
      if (b !== t) b.alive = false
    })
    g.bricksLeft = 1
    g.status = 'playing'
    Object.assign(g.ball, { x: t.x + t.w / 2, y: t.y + t.h + 12, vx: 0, vy: -360 })
    rodar(g, 6)
    expect(g.score).toBe(60)
  })

  it('a bola acelera a cada tijolo, mas respeita o teto', () => {
    const g = criarJogo()
    const antes = g.speed
    const t = g.bricks[g.bricks.length - 1]
    g.status = 'playing'
    Object.assign(g.ball, { x: t.x + t.w / 2, y: t.y + t.h + 12, vx: 0, vy: -360 })
    rodar(g, 6)
    expect(g.speed).toBeGreaterThan(antes)

    g.speed = 10_000
    g.status = 'playing'
    const outro = g.bricks.find((b) => b.alive && b.row === 5)
    Object.assign(g.ball, { x: outro.x + outro.w / 2, y: outro.y + outro.h + 12, vx: 0, vy: -360 })
    rodar(g, 6)
    expect(g.speed).toBeLessThanOrEqual(760)
  })

  it('bola muito rápida não atravessa o tijolo (sub-passos)', () => {
    const g = criarJogo()
    const t = g.bricks[g.bricks.length - 1]
    g.status = 'playing'
    g.speed = 760
    Object.assign(g.ball, { x: t.x + t.w / 2, y: t.y + t.h + 60, vx: 0, vy: -760 })
    rodar(g, 12)
    expect(t.alive).toBe(false)
  })

  it('limpar todos os tijolos sobe de nível, recria o campo e acelera', () => {
    const g = criarJogo()
    g.bricks.forEach((b, i) => {
      if (i > 0) b.alive = false
    })
    g.bricksLeft = 1
    const ultimo = g.bricks[0]
    g.status = 'playing'
    Object.assign(g.ball, { x: ultimo.x + ultimo.w / 2, y: ultimo.y + ultimo.h + 12, vx: 0, vy: -360 })

    rodar(g, 6)

    expect(g.level).toBe(2)
    expect(g.status).toBe('ready')
    expect(g.bricksLeft).toBe(60)
    expect(g.speed).toBe(velocidadeBase(2))
    expect(velocidadeBase(2)).toBeGreaterThan(velocidadeBase(1))
  })
})

describe('vidas e game over', () => {
  it('cair pelo fundo tira uma vida e volta para o estado pronto', () => {
    const g = emJogo({ x: 20, y: H - 5, vx: 0, vy: 400 })
    g.paddle.x = 700 // raquete longe, a bola cai
    rodar(g, 20)
    expect(g.lives).toBe(2)
    expect(g.status).toBe('ready')
  })

  it('perder a última vida termina o jogo e guarda a pontuação', () => {
    const g = emJogo({ x: 20, y: H - 5, vx: 0, vy: 400 })
    g.paddle.x = 700
    g.lives = 1
    g.score = 120
    rodar(g, 20)
    expect(g.status).toBe('over')
    expect(g.score).toBe(120)
  })

  it('depois do game over a bola não se move mais', () => {
    const g = criarJogo()
    g.status = 'over'
    const { x, y } = g.ball
    rodar(g, 10)
    expect(g.ball.x).toBe(x)
    expect(g.ball.y).toBe(y)
  })
})

describe('robustez', () => {
  it('um dt gigante (aba parada) não teleporta a bola', () => {
    const g = criarJogo()
    lancar(g, () => 0.5)
    passo(g, 5, SEM_INPUT) // 5 segundos de uma vez
    expect(g.ball.y).toBeGreaterThan(g.paddle.y - 30) // andou no máximo ~1/30 s
  })

  it('partículas nascem ao quebrar e somem com o tempo', () => {
    const g = criarJogo()
    const t = g.bricks[g.bricks.length - 1]
    g.status = 'playing'
    Object.assign(g.ball, { x: t.x + t.w / 2, y: t.y + t.h + 12, vx: 0, vy: -360 })
    rodar(g, 6)
    expect(g.particles.length).toBeGreaterThan(0)

    g.status = 'paused'
    rodar(g, 120) // 2 segundos
    expect(g.particles).toHaveLength(0)
  })
})
