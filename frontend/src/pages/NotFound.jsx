import { Link } from 'react-router-dom'
import Background from '@/components/Background'
import Button from '@/components/Button'

export default function NotFound() {
  return (
    <>
      <Background />
      <main className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <p className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-7xl font-extrabold text-transparent">
            404
          </p>
          <p className="mt-3 text-slate-400">Essa página não existe.</p>
          <Link to="/login" className="mt-6 inline-block">
            <Button>Ir para o login</Button>
          </Link>
        </div>
      </main>
    </>
  )
}
