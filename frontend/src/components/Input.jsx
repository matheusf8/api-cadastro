import { useId } from 'react'
import { cn } from '@/lib/cn'

// Campo com label, dica e mensagem de erro, já ligados por acessibilidade
// (label/htmlFor, aria-invalid e aria-describedby).
// `suffix`: elemento colocado dentro do campo, à direita (ex.: botão de mostrar senha).
export default function Input({ label, error, hint, suffix, className, ...props }) {
  const id = useId()
  const descId = `${id}-desc`

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? descId : undefined}
          className={cn(
            'w-full rounded-xl border bg-surface-2/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500',
            'transition focus:outline-none focus:ring-2',
            suffix && 'pr-12',
            error
              ? 'border-danger/70 focus:ring-danger/40'
              : 'border-border focus:border-accent focus:ring-accent/40',
          )}
          {...props}
        />
        {suffix && <div className="absolute inset-y-0 right-2 flex items-center">{suffix}</div>}
      </div>
      {(error || hint) && (
        <p
          id={descId}
          role={error ? 'alert' : undefined}
          className={cn('text-xs', error ? 'text-danger' : 'text-slate-500')}
        >
          {error || hint}
        </p>
      )}
    </div>
  )
}
