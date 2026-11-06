import { cn } from '@/lib/cn'

// Cartão "vidro": fundo translúcido com blur e borda fina.
export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-white/10 bg-surface/70 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
