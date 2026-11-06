// Onde os tokens ficam guardados no navegador.
//
// DECISÃO (veja docs/decisoes.md #14):
// - access token  -> só em MEMÓRIA (variável). Some ao recarregar a página e não pode
//                    ser lido por scripts de outras origens nem fica em disco.
// - refresh token -> localStorage, para o usuário continuar logado após recarregar.
//
// Trade-off: tudo em localStorage é vulnerável a XSS (script malicioso lê o token).
// Cookie httpOnly resolve isso, mas troca o risco por CSRF e exige mudar a API.
// Melhoria futura: refresh em cookie httpOnly + SameSite.

const CHAVE_REFRESH = 'rebote.refresh_token'

let accessToken = null

export const tokenStore = {
  getAccess: () => accessToken,
  setAccess: (token) => {
    accessToken = token
  },
  getRefresh: () => localStorage.getItem(CHAVE_REFRESH),
  setRefresh: (token) => localStorage.setItem(CHAVE_REFRESH, token),
  clear: () => {
    accessToken = null
    localStorage.removeItem(CHAVE_REFRESH)
  },
}
