import Background from '@/components/Background'
import Card from '@/components/Card'

// Painel da marca (só em telas grandes): tagline + mini arena com a bolinha quicando,
// um aperitivo do jogo que espera depois do login.
function PainelMarca() {
  return (
    <aside className="hidden flex-col justify-center gap-10 px-12 lg:flex">
      <div>
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 shadow-lg shadow-accent/30">
            <span className="size-3.5 rounded-full bg-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">Rebote</span>
        </div>
        <h2 className="max-w-md text-5xl leading-[1.1] font-extrabold tracking-tight">
          Entre, jogue e{' '}
          <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
            bata seu recorde
          </span>
        </h2>
        <p className="mt-5 max-w-sm text-slate-400">
          Conta segura com autenticação JWT e um mini jogo esperando por você.
        </p>
      </div>

      <div
        aria-hidden
        className="relative h-44 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-surface/50 backdrop-blur"
      >
        <span className="absolute size-5 animate-ball-x">
          <span className="block size-5 animate-ball-y rounded-full bg-gradient-to-br from-accent-2 to-accent shadow-[0_0_24px_6px] shadow-accent-2/50" />
        </span>
        <span className="absolute bottom-3 left-1/2 h-2 w-24 -translate-x-1/2 rounded-full bg-white/80" />
      </div>
    </aside>
  )
}

// Moldura das telas de login/cadastro: fundo animado + (marca) + cartão do formulário.
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <>
      <Background />
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-2">
        <PainelMarca />
        <main className="grid place-items-center px-4 py-10">
          <div className="w-full max-w-md animate-fade-up">
            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 shadow-lg shadow-accent/30 lg:hidden">
                <span className="size-3.5 rounded-full bg-white" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
              {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
            </div>
            <Card>{children}</Card>
            {footer && <p className="mt-6 text-center text-sm text-slate-400">{footer}</p>}
          </div>
        </main>
      </div>
    </>
  )
}
