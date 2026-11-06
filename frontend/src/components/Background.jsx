// Fundo com "auroras" desfocadas que flutuam devagar. Fica atrás de tudo (fixed + -z-10).
export default function Background() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-bg">
      <div className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-accent/30 blur-[120px] animate-float" />
      <div className="absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-accent-2/20 blur-[130px] animate-float-slow" />
      {/* grade sutil */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />
    </div>
  )
}
