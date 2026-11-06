// Mapa de rotas da aplicação.
//  - GuestRoute:     só para quem NÃO está logado (login, cadastro)
//  - ProtectedRoute: só para quem está logado (jogo)
import { Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute, ProtectedRoute } from '@/auth/ProtectedRoute'
import Cadastro from '@/pages/Cadastro'
import Jogo from '@/pages/Jogo'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import Status from '@/pages/Status'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/jogo" element={<Jogo />} />
      </Route>

      <Route path="/status" element={<Status />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
