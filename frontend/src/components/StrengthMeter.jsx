import { forcaSenha } from '@/lib/validators'
import { cn } from '@/lib/cn'

const CORES = ['bg-danger', 'bg-danger', 'bg-amber-400', 'bg-accent-2', 'bg-ok']

// Barrinha de 4 segmentos que acende conforme a força da senha.
export default function StrengthMeter({ senha }) {
  if (!senha) return null
  const { nivel, rotulo } = forcaSenha(senha)
  const acesos = Math.max(nivel, 1) // pelo menos 1 segmento quando há texto

  return (
    <div aria-live="polite" className="space-y-1.5">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              i <= acesos ? CORES[nivel] : 'bg-border',
            )}
          />
        ))}
      </div>
      <p className="text-xs text-slate-400">
        Força da senha: <span className="font-semibold text-slate-200">{rotulo}</span>
      </p>
    </div>
  )
}
