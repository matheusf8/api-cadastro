// Funções que falam com os endpoints de autenticação.
import { api } from '@/api/client'

export const registrar = ({ nome, email, senha, convite = '' }) =>
  api
    .post('/auth/register', {
      nome: nome.trim(),
      email: email.trim(),
      senha,
      codigo_convite: convite.trim(),
    })
    .then((r) => r.data)

export const entrar = ({ email, senha }) =>
  api.post('/auth/login', { email: email.trim(), senha }).then((r) => r.data)

export const buscarMe = () => api.get('/users/me').then((r) => r.data)
