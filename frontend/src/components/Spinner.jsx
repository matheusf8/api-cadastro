import Background from '@/components/Background'

// Tela cheia de carregamento (enquanto o app descobre se há sessão).
export default function Spinner() {
  return (
    <>
      <Background />
      <div role="status" aria-label="Carregando" className="grid min-h-screen place-items-center">
        <span className="size-10 animate-spin rounded-full border-4 border-white/10 border-t-accent-2" />
      </div>
    </>
  )
}
