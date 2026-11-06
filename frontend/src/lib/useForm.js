// Hook mínimo de formulário controlado.
// - `validators` deve ser um objeto ESTÁVEL (declarado fora do componente).
// - O erro de um campo só aparece depois que o usuário sai dele (touched) ou tenta enviar.
import { useMemo, useState } from 'react'

export function useForm(initial, validators) {
  const [values, setValues] = useState(initial)
  const [touched, setTouched] = useState({})

  const errors = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(validators).map(([campo, validar]) => [campo, validar(values[campo], values)]),
      ),
    [values, validators],
  )

  // Props prontas para espalhar no <Input {...bind('email')} />
  const bind = (campo) => ({
    name: campo,
    value: values[campo],
    onChange: (e) => setValues((v) => ({ ...v, [campo]: e.target.value })),
    onBlur: () => setTouched((t) => ({ ...t, [campo]: true })),
    error: touched[campo] ? errors[campo] || undefined : undefined,
  })

  const touchAll = () =>
    setTouched(Object.fromEntries(Object.keys(validators).map((campo) => [campo, true])))

  const isValid = Object.values(errors).every((e) => !e)

  return { values, errors, bind, touchAll, isValid }
}
