import Card from '@/components/Card'
import { cn } from '@/lib/cn'

const MEDALHAS = ['🥇', '🥈', '🥉']

// Painel lateral: recorde pessoal + top 10. `ranking` e `meus` vêm da API (null = carregando).
export default function Ranking({ ranking, meus, erro }) {
  return (
    <Card className="space-y-6 p-6">
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-2xl border border-white/10 bg-surface-2/60 px-3 py-4">
          <p className="text-xs text-slate-400">Seu recorde</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums">{meus ? meus.recorde : '–'}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-surface-2/60 px-3 py-4">
          <p className="text-xs text-slate-400">Partidas</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums">{meus ? meus.partidas : '–'}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-300 uppercase">Top 10</h2>
        {erro && <p className="text-sm text-danger">{erro}</p>}
        {!erro && ranking === null && <p className="text-sm text-slate-500">Carregando...</p>}
        {!erro && ranking?.length === 0 && (
          <p className="text-sm text-slate-500">Ninguém pontuou ainda. Seja o primeiro!</p>
        )}
        <ol className="space-y-1.5">
          {ranking?.map((item) => (
            <li
              key={item.posicao}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm',
                item.voce ? 'bg-accent/20 ring-1 ring-accent/50' : 'bg-surface-2/40',
              )}
            >
              <span className="w-6 text-center tabular-nums text-slate-400">
                {MEDALHAS[item.posicao - 1] ?? item.posicao}
              </span>
              <span className="flex-1 truncate font-medium">
                {item.nome}
                {item.voce && <span className="ml-2 text-xs text-accent-2">você</span>}
              </span>
              <span className="font-bold tabular-nums">{item.pontos}</span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  )
}
