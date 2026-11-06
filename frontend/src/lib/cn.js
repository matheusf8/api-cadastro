// Junta nomes de classes ignorando valores vazios: cn("a", cond && "b") -> "a b"
export const cn = (...classes) => classes.filter(Boolean).join(' ')
