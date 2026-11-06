// O "canal" do contexto de autenticação. Fica num arquivo próprio porque o Fast Refresh
// do React só funciona bem em arquivos que exportam apenas componentes.
import { createContext } from 'react'

export const AuthContext = createContext(null)
