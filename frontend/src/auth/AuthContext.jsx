// Contexto de autenticação: qualquer componente pergunta "quem está logado?" via useAuth().
//
// status:  'carregando' (descobrindo se há sessão)  |  'autenticado'  |  'anonimo'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { buscarMe, entrar, registrar } from '@/api/auth'
import { registrarAoPerderSessao } from '@/api/client'
import { AuthContext } from '@/auth/context'
import { tokenStore } from '@/auth/tokenStore'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('carregando')

  // Se a sessão morrer em qualquer requisição (refresh falhou), volta para anônimo.
  useEffect(() => {
    registrarAoPerderSessao(() => {
      setUser(null)
      setStatus('anonimo')
    })
  }, [])

  // Ao abrir o app: há refresh token salvo? Então tenta restaurar a sessão.
  // (o access some ao recarregar; o interceptor renova sozinho no primeiro 401)
  useEffect(() => {
    let cancelado = false
    async function restaurar() {
      if (!tokenStore.getRefresh()) {
        setStatus('anonimo')
        return
      }
      try {
        const me = await buscarMe()
        if (!cancelado) {
          setUser(me)
          setStatus('autenticado')
        }
      } catch {
        if (!cancelado) {
          tokenStore.clear()
          setUser(null)
          setStatus('anonimo')
        }
      }
    }
    restaurar()
    return () => {
      cancelado = true
    }
  }, [])

  const login = useCallback(async (credenciais) => {
    const tokens = await entrar(credenciais)
    tokenStore.setAccess(tokens.access_token)
    tokenStore.setRefresh(tokens.refresh_token)
    setUser(await buscarMe())
    setStatus('autenticado')
  }, [])

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
    setStatus('anonimo')
  }, [])

  const value = useMemo(
    () => ({ user, status, login, logout, register: registrar }),
    [user, status, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
