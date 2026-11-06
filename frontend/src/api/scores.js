// Funções que falam com os endpoints de pontuação (todos exigem login; o interceptor
// do client.js já anexa o token).
import { api } from '@/api/client'

export const salvarPontuacao = (pontos) => api.post('/scores', { pontos }).then((r) => r.data)
export const buscarRanking = () => api.get('/scores/top').then((r) => r.data)
export const buscarMeusPontos = () => api.get('/scores/me').then((r) => r.data)
