// Mapa de rotas da aplicação.
// /jogo ainda é pública; vira protegida (ProtectedRoute) na Etapa 7.
import { Navigate, Route, Routes } from 'react-router-dom'
import Cadastro from '@/pages/Cadastro'
import Jogo from '@/pages/Jogo'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import Status from '@/pages/Status'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/jogo" element={<Jogo />} />
      <Route path="/status" element={<Status />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
