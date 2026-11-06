// Desenho do jogo no canvas. Só LÊ o estado (nunca altera): `desenhar(ctx, g)`.
import { H, W } from '@/game/engine'

function retanguloArredondado(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

export function desenhar(ctx, g, tempo) {
  ctx.clearRect(0, 0, W, H)

  // grade de fundo bem sutil
  ctx.strokeStyle = 'rgba(255,255,255,0.035)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 0; x <= W; x += 40) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
  }
  for (let y = 0; y <= H; y += 40) {
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
  }
  ctx.stroke()

  // tijolos: gradiente vertical + brilho da cor
  for (const t of g.bricks) {
    if (!t.alive) continue
    const grad = ctx.createLinearGradient(0, t.y, 0, t.y + t.h)
    grad.addColorStop(0, `hsl(${t.hue} 90% 68%)`)
    grad.addColorStop(1, `hsl(${t.hue} 85% 52%)`)
    ctx.shadowColor = `hsl(${t.hue} 90% 60% / 0.55)`
    ctx.shadowBlur = 12
    ctx.fillStyle = grad
    retanguloArredondado(ctx, t.x, t.y, t.w, t.h, 6)
    ctx.fill()
  }
  ctx.shadowBlur = 0

  // partículas das batidas
  for (const f of g.particles) {
    const a = Math.max(f.life / f.max, 0)
    ctx.globalAlpha = a
    ctx.fillStyle = `hsl(${f.hue} 95% 70%)`
    ctx.beginPath()
    ctx.arc(f.x, f.y, f.size * a + 0.5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // rastro da bola: círculos que vão sumindo e encolhendo
  const n = g.trail.length
  g.trail.forEach((p, i) => {
    const k = (i + 1) / n
    ctx.globalAlpha = k * 0.35
    ctx.fillStyle = '#22d3ee'
    ctx.beginPath()
    ctx.arc(p.x, p.y, g.ball.r * k, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.globalAlpha = 1

  // raquete
  const p = g.paddle
  const gradRaquete = ctx.createLinearGradient(p.x - p.w / 2, 0, p.x + p.w / 2, 0)
  gradRaquete.addColorStop(0, '#7c5cff')
  gradRaquete.addColorStop(1, '#22d3ee')
  ctx.shadowColor = 'rgba(124,92,255,0.7)'
  ctx.shadowBlur = 18
  ctx.fillStyle = gradRaquete
  retanguloArredondado(ctx, p.x - p.w / 2, p.y, p.w, p.h, 7)
  ctx.fill()

  // bola (pulsa de leve quando está esperando o lançamento)
  const b = g.ball
  const pulso = g.status === 'ready' ? 1 + Math.sin(tempo / 180) * 0.12 : 1
  ctx.shadowColor = 'rgba(34,211,238,0.9)'
  ctx.shadowBlur = 22
  const gradBola = ctx.createRadialGradient(b.x - 2, b.y - 2, 1, b.x, b.y, b.r * pulso)
  gradBola.addColorStop(0, '#ffffff')
  gradBola.addColorStop(1, '#22d3ee')
  ctx.fillStyle = gradBola
  ctx.beginPath()
  ctx.arc(b.x, b.y, b.r * pulso, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
}
