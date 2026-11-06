// Página provisória da Etapa 0: prova que front e back conversam (CORS + URL ok).
// Será substituída pelas telas de login/cadastro nas Etapas 5 e 6.
import { useEffect, useState } from 'react'
import { api } from '@/api/client'

export default function Status() {
  const [estado, setEstado] = useState('verificando')

  useEffect(() => {
    api
      .get('/health')
      .then(() => setEstado('online'))
      .catch(() => setEstado('offline'))
  }, [])

  const cor = { online: 'text-ok', offline: 'text-danger', verificando: 'text-slate-400' }[estado]

  return (
    <main className="min-h-screen grid place-items-center">
      <div className="rounded-2xl border border-border bg-surface p-10 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
          API Cadastro
        </h1>
        <p className="mt-4 text-slate-400">
          Backend: <span className={`font-semibold ${cor}`}>{estado}</span>
        </p>
      </div>
    </main>
  )
}
