import { useState } from 'react'
import Input from '@/components/Input'

const Olho = ({ cortado }) => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {cortado && <path d="M4 4l16 16" />}
  </svg>
)

// Input de senha com botão "mostrar/ocultar".
export default function PasswordInput(props) {
  const [visivel, setVisivel] = useState(false)

  return (
    <Input
      {...props}
      type={visivel ? 'text' : 'password'}
      suffix={
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visivel}
          className="rounded-lg p-2 text-slate-400 transition hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-accent-2"
        >
          <Olho cortado={visivel} />
        </button>
      }
    />
  )
}
