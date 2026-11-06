// Catraca do front: só deixa passar quem está logado.
// IMPORTANTE: isto é UX, não segurança. Quem protege os dados de verdade é a API (401).
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import Spinner from '@/components/Spinner'

export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'carregando') return <Spinner />
  // `state.from` guarda a página que a pessoa queria, para voltar depois do login.
  if (status === 'anonimo') return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

// O inverso: quem já está logado não precisa ver login/cadastro.
export function GuestRoute() {
  const { status } = useAuth()

  if (status === 'carregando') return <Spinner />
  if (status === 'autenticado') return <Navigate to="/jogo" replace />
  return <Outlet />
}
