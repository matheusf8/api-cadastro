import { cn } from '@/lib/cn'

const variantes = {
  primary:
    'bg-gradient-to-r from-accent to-accent-2 text-white shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:brightness-110',
  ghost: 'border border-border bg-surface-2/60 text-slate-200 hover:bg-surface-2 hover:border-slate-600',
}

// `loading` desativa o botão e mostra um spinner (evita duplo clique no envio).
export default function Button({
  variant = 'primary',
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold',
        'transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantes[variant],
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
        />
      )}
      {children}
    </button>
  )
}
