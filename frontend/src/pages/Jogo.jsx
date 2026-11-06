// Tela pós-login (rota protegida). O jogo (canvas) entra na Etapa 8.
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import Background from '@/components/Background'
import Button from '@/components/Button'
import Card from '@/components/Card'

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
      <main className="grid min-h-[70vh] place-items-center px-4">
        <Card className="max-w-md text-center">
          <p className="text-5xl">🎮</p>
          <h1 className="mt-4 text-2xl font-extrabold">O jogo chega na Etapa 8</h1>
          <p className="mt-2 text-sm text-slate-400">Você está logado como {user.email}.</p>
        </Card>
      </main>
    </>
  )
}
