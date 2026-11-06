// Ponte entre o React e o motor do jogo.
//  - O estado do jogo vive num useRef (muda 60x por segundo SEM re-renderizar o React).
//  - O placar (HUD) vira estado do React só quando score/vidas/nível/status MUDAM.
//  - O useEffect liga o loop (requestAnimationFrame) e os eventos, e DESLIGA tudo ao sair
//    da tela (senão o loop ficaria rodando "no vazio": vazamento de memória/CPU).
import { useCallback, useEffect, useRef, useState } from 'react'
import Button from '@/components/Button'
import { alternarPausa, criarJogo, H, lancar, passo, W } from '@/game/engine'
import { desenhar } from '@/game/render'

const Coracao = ({ cheio }) => (
  <svg viewBox="0 0 24 24" className={`size-5 ${cheio ? 'text-danger' : 'text-white/15'}`} fill="currentColor" aria-hidden>
    <path d="M12 21s-8-4.9-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.100-8 11-8 11Z" />
  </svg>
)

// `e.code` é a tecla física (Space, KeyA...). Alguns ambientes só preenchem `e.key`,
// então caímos nele para o jogo funcionar em qualquer teclado/emulador.
const TECLAS_POR_KEY = { ' ': 'Space', a: 'KeyA', A: 'KeyA', d: 'KeyD', D: 'KeyD', p: 'KeyP', P: 'KeyP' }
const tecla = (e) => e.code || TECLAS_POR_KEY[e.key] || e.key

export default function Game({ onGameOver }) {
  const canvasRef = useRef(null)
  const jogoRef = useRef(criarJogo())
  const inputRef = useRef({ pointerX: null, dir: 0 })
  const onGameOverRef = useRef(onGameOver)
  const [hud, setHud] = useState(() => ({ status: 'ready', score: 0, lives: 3, level: 1 }))

  useEffect(() => {
    onGameOverRef.current = onGameOver
  }, [onGameOver])

  // Ação principal (espaço / clique / toque): lança, pausa, retoma ou recomeça.
  const acao = useCallback(() => {
    const g = jogoRef.current
    if (g.status === 'ready') lancar(g)
    else if (g.status === 'playing' || g.status === 'paused') alternarPausa(g)
    else if (g.status === 'over') jogoRef.current = criarJogo()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Nitidez em telas retina: o canvas tem mais pixels reais que o tamanho em CSS.
    const dpr = window.devicePixelRatio || 1
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    let rafId
    let ultimo = performance.now()
    let ultimoHud = { status: '', score: -1, lives: -1, level: -1 }
    let avisouFim = false

    function loop(agora) {
      const g = jogoRef.current
      passo(g, (agora - ultimo) / 1000, inputRef.current)
      ultimo = agora
      desenhar(ctx, g, agora)

      // Atualiza o React só se algo visível mudou.
      if (
        g.status !== ultimoHud.status ||
        g.score !== ultimoHud.score ||
        g.lives !== ultimoHud.lives ||
        g.level !== ultimoHud.level
      ) {
        ultimoHud = { status: g.status, score: g.score, lives: g.lives, level: g.level }
        setHud(ultimoHud)
      }

      // Avisa a página UMA vez quando o jogo acaba (a Etapa 9 salva a pontuação aqui).
      if (g.status === 'over' && !avisouFim) {
        avisouFim = true
        onGameOverRef.current?.(g.score)
      } else if (g.status !== 'over') {
        avisouFim = false
      }

      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    // ---- entrada
    const input = inputRef.current
    const aoMoverPonteiro = (e) => {
      const r = canvas.getBoundingClientRect()
      input.pointerX = ((e.clientX - r.left) * W) / r.width // tela -> coordenada do jogo
    }
    const aoTeclaBaixo = (e) => {
      const t = tecla(e)
      if (e.repeat) {
        if (t === 'Space') e.preventDefault()
        return
      }
      if (t === 'ArrowLeft' || t === 'KeyA') {
        input.dir = -1
        input.pointerX = null
      } else if (t === 'ArrowRight' || t === 'KeyD') {
        input.dir = 1
        input.pointerX = null
      } else if (t === 'Space') {
        e.preventDefault() // evita rolar a página
        acao()
      } else if (t === 'KeyP') {
        alternarPausa(jogoRef.current)
      }
    }
    const aoTeclaCima = (e) => {
      const t = tecla(e)
      if ((t === 'ArrowLeft' || t === 'KeyA') && input.dir === -1) input.dir = 0
      if ((t === 'ArrowRight' || t === 'KeyD') && input.dir === 1) input.dir = 0
    }
    // Aba escondida ou janela sem foco: pausa sozinho.
    const pausarSeEscondeu = () => {
      if (document.hidden && jogoRef.current.status === 'playing') alternarPausa(jogoRef.current)
    }
    const aoPerderFoco = () => {
      if (jogoRef.current.status === 'playing') alternarPausa(jogoRef.current)
      input.dir = 0
    }

    canvas.addEventListener('pointermove', aoMoverPonteiro)
    canvas.addEventListener('pointerdown', aoMoverPonteiro)
    window.addEventListener('keydown', aoTeclaBaixo)
    window.addEventListener('keyup', aoTeclaCima)
    window.addEventListener('blur', aoPerderFoco)
    document.addEventListener('visibilitychange', pausarSeEscondeu)

    // Limpeza: roda quando o componente sai da tela (ou o efeito é refeito).
    return () => {
      cancelAnimationFrame(rafId)
      canvas.removeEventListener('pointermove', aoMoverPonteiro)
      canvas.removeEventListener('pointerdown', aoMoverPonteiro)
      window.removeEventListener('keydown', aoTeclaBaixo)
      window.removeEventListener('keyup', aoTeclaCima)
      window.removeEventListener('blur', aoPerderFoco)
      document.removeEventListener('visibilitychange', pausarSeEscondeu)
    }
  }, [acao])

  const mensagem = {
    ready: {
      titulo: hud.level > 1 ? `Nível ${hud.level}` : 'Pronto?',
      texto: 'Mova o mouse (ou use ← →) e clique ou aperte Espaço para lançar',
      botao: 'Lançar',
    },
    paused: { titulo: 'Pausado', texto: 'Clique ou aperte Espaço para continuar', botao: 'Continuar' },
    over: { titulo: 'Fim de jogo', texto: `Você fez ${hud.score} pontos`, botao: 'Jogar de novo' },
  }[hud.status]

  return (
    <div className="w-full max-w-3xl">
      {/* HUD */}
      <div className="mb-3 flex items-center justify-between px-1 text-sm">
        <div className="flex items-baseline gap-2">
          <span className="text-slate-400">Pontos</span>
          <span className="text-2xl font-extrabold tabular-nums">{hud.score}</span>
        </div>
        <span className="rounded-full border border-white/10 bg-surface/60 px-3 py-1 text-xs font-semibold text-slate-300">
          Nível {hud.level}
        </span>
        <div className="flex gap-1" aria-label={`${hud.lives} vidas`}>
          {[0, 1, 2].map((i) => (
            <Coracao key={i} cheio={i < hud.lives} />
          ))}
        </div>
      </div>

      {/* Arena */}
      <div className="relative aspect-[8/5] overflow-hidden rounded-3xl border border-white/10 bg-surface/60 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <canvas
          ref={canvasRef}
          className="size-full cursor-none touch-none"
          // Clique não pausa durante o jogo (seria fácil pausar sem querer); só lança/retoma/recomeça.
          onClick={() => jogoRef.current.status !== 'playing' && acao()}
          aria-label="Área do jogo"
        />
        {mensagem && (
          <div className="absolute inset-0 grid place-items-center bg-bg/55 backdrop-blur-[2px]">
            <div className="max-w-xs px-4 text-center">
              <h2 className="text-3xl font-extrabold tracking-tight">{mensagem.titulo}</h2>
              <p className="mt-2 text-sm text-slate-300">{mensagem.texto}</p>
              <Button className="mt-5" onClick={acao}>
                {mensagem.botao}
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-slate-500">
        Mouse ou ← → para mover · Espaço lança, pausa e retoma · P também pausa
      </p>
    </div>
  )
}
