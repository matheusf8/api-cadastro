// Cliente HTTP único do projeto. Todas as chamadas à API passam por aqui.
//
// Interceptors (código que roda em TODA requisição/resposta):
//  - requisição: anexa  Authorization: Bearer <access>
//  - resposta 401: tenta renovar o access com o refresh UMA vez e repete a chamada;
//    se a renovação falhar, limpa os tokens e avisa o app (volta para o login).
import axios from 'axios'
import { tokenStore } from '@/auth/tokenStore'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export const api = axios.create({ baseURL })

// O AuthContext registra aqui o que fazer quando a sessão morre.
let aoPerderSessao = () => {}
export const registrarAoPerderSessao = (fn) => {
  aoPerderSessao = fn
}

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Se várias requisições tomarem 401 juntas, todas esperam UMA só renovação.
let renovando = null

function renovarAccess() {
  if (!renovando) {
    const refresh = tokenStore.getRefresh()
    if (!refresh) return Promise.reject(new Error('sem refresh token'))

    // axios "puro" (sem interceptors) para não entrar em loop se o refresh também der 401.
    renovando = axios
      .post(`${baseURL}/auth/refresh`, { refresh_token: refresh })
      .then(({ data }) => {
        tokenStore.setAccess(data.access_token)
        return data.access_token
      })
      .finally(() => {
        renovando = null
      })
  }
  return renovando
}

api.interceptors.response.use(
  (resposta) => resposta,
  async (erro) => {
    const original = erro.config
    const ehRotaDeAuth = original?.url?.startsWith('/auth/') // login errado também é 401: não renovar

    if (erro.response?.status !== 401 || !original || original._jaTentou || ehRotaDeAuth) {
      return Promise.reject(erro)
    }

    original._jaTentou = true
    try {
      const novoAccess = await renovarAccess()
      original.headers.Authorization = `Bearer ${novoAccess}`
      return api(original) // repete a chamada original
    } catch {
      tokenStore.clear()
      aoPerderSessao()
      return Promise.reject(erro)
    }
  },
)
