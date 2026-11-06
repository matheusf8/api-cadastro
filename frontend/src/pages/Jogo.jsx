// Tela pós-login. O jogo (canvas) entra na Etapa 8; a proteção da rota, na Etapa 7.
import { Link } from 'react-router-dom'
import Background from '@/components/Background'
import Button from '@/components/Button'
import Card from '@/components/Card'

export default function Jogo() {
  return (
    <>
      <Background />
      <main className="grid min-h-screen place-items-center px-4">
        <Card className="max-w-md text-center">
          <p className="text-5xl">🎮</p>
          <h1 className="mt-4 text-2xl font-extrabold">O jogo chega na Etapa 8</h1>
          <p className="mt-2 text-sm text-slate-400">Aqui vai ficar a bolinha que rebate.</p>
          <Link to="/login" className="mt-6 inline-block">
            <Button variant="ghost">Voltar ao login</Button>
          </Link>
        </Card>
      </main>
    </>
  )
}
