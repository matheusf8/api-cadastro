// Cliente HTTP único do projeto. Todas as chamadas à API passam por aqui.
// Na Etapa 7 ganhará interceptors (anexar o Bearer token e renovar no 401).
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
})
