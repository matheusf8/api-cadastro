import Background from '@/components/Background'
import Card from '@/components/Card'

// Moldura das telas de login/cadastro: fundo animado + cartão central com a marca.
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <>
      <Background />
      <main className="grid min-h-screen place-items-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-xl shadow-lg shadow-accent/30">
              ●
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
          </div>
          <Card>{children}</Card>
          {footer && <p className="mt-6 text-center text-sm text-slate-400">{footer}</p>}
        </div>
      </main>
    </>
  )
}
