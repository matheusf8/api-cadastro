// Tela pós-login (rota protegida): jogo + recorde pessoal + ranking.
// Ao fim da partida o jogo avisa (onGameOver) e a pontuação é salva na API com o JWT.
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mensagemDeErro } from '@/api/errors'
import { buscarMeusPontos, buscarRanking, salvarPontuacao } from '@/api/scores'
import { useAuth } from '@/auth/useAuth'
import Background from '@/components/Background'
import Button from '@/components/Button'
import Game from '@/components/Game'
import Ranking from '@/components/Ranking'

export default function Jogo() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [ranking, setRanking] = useState(null)
  const [meus, setMeus] = useState(null)
  const [erro, setErro] = useState('')
  const [resultado, setResultado] = useState('')

  // Busca ranking + meu recorde e atualiza o painel. Devolve a promessa para quem quiser esperar.
  const carregar = useCallback(
    () =>
      Promise.all([buscarRanking(), buscarMeusPontos()])
        .then(([top, eu]) => {
          setRanking(top)
          setMeus(eu)
          setErro('')
        })
        .catch((e) => setErro(mensagemDeErro(e))),
    [],
  )

  // Primeira carga ao abrir a tela. `vivo` evita atualizar estado se a tela já foi fechada.
  useEffect(() => {
    let vivo = true
    Promise.all([buscarRanking(), buscarMeusPontos()])
      .then(([top, eu]) => {
        if (!vivo) return
        setRanking(top)
        setMeus(eu)
      })
      .catch((e) => vivo && setErro(mensagemDeErro(e)))
    return () => {
      vivo = false
    }
  }, [])

  // Fim de partida: salva e atualiza o painel. `meus` (recorde ANTES da partida) diz se bateu o recorde.
  async function aoFimDeJogo(pontos) {
    if (pontos <= 0) {
      setResultado('')
      return
    }
    setResultado('Salvando pontuação...')
    const recordeAnterior = meus?.recorde ?? 0
    try {
      await salvarPontuacao(pontos)
      setResultado(pontos > recordeAnterior ? '🏆 Novo recorde!' : `Seu recorde: ${recordeAnterior}`)
      carregar()
    } catch (e) {
      setResultado(`Não foi possível salvar: ${mensagemDeErro(e)}`)
    }
  }

  function sair() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <Background />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <span className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-2">
            <span className="size-2.5 rounded-full bg-white" />
          </span>
          Rebote
        </span>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-300 sm:block">
            Olá, <strong className="text-white">{user.nome}</strong>
          </span>
          <Button variant="ghost" className="px-4 py-2" onClick={sair}>
            Sair
          </Button>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-6 px-4 pb-10 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="flex justify-center">
          <Game onGameOver={aoFimDeJogo} fimExtra={resultado} />
        </div>
        <Ranking ranking={ranking} meus={meus} erro={erro} />
      </main>
    </>
  )
}
