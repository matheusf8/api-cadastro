// Devolve true quando algo está carregando há mais de `ms`.
// Uso: o servidor gratuito "dorme" sem uso e leva até ~1 minuto para acordar;
// avisar a pessoa evita que ela ache que o site travou.
import { useEffect, useState } from 'react'

export function useAvisoDemora(carregando, ms = 4000) {
  const [demorando, setDemorando] = useState(false)

  useEffect(() => {
    if (!carregando) return
    const timer = setTimeout(() => setDemorando(true), ms)
    // Limpeza: cancela o timer e zera o aviso quando o carregamento termina.
    return () => {
      clearTimeout(timer)
      setDemorando(false)
    }
  }, [carregando, ms])

  return demorando
}

export const AVISO_SERVIDOR_ACORDANDO =
  'O servidor estava dormindo e está acordando. Isso pode levar até 1 minuto, só na primeira vez.'
