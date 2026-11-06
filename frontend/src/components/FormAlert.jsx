import { cn } from '@/lib/cn'

// Aviso no topo do formulário (erro do servidor ou mensagem de sucesso).
export default function FormAlert({ tipo = 'erro', children }) {
  if (!children) return null
  return (
    <div
      role={tipo === 'erro' ? 'alert' : 'status'}
      className={cn(
        'rounded-xl border px-4 py-3 text-sm',
        tipo === 'erro'
          ? 'border-danger/40 bg-danger/10 text-red-200'
          : 'border-ok/40 bg-ok/10 text-emerald-200',
      )}
    >
      {children}
    </div>
  )
}
