// Tela pós-login (rota protegida): cabeçalho com o usuário + o jogo.
// O ranking e o salvamento de pontos entram na Etapa 9 (onGameOver já avisa o fim da partida).
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import Background from '@/components/Background'
import Button from '@/components/Button'
import Game from '@/components/Game'

export default function Jogo() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function sair() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <Background />
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
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
      <main className="flex justify-center px-4 pb-10">
        <Game />
      </main>
    </>
  )
}
