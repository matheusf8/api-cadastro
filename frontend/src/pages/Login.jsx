// Esqueleto da tela de login (Etapa 5). Validação e visual final: Etapa 6. API: Etapa 7.
import { Link } from 'react-router-dom'
import AuthLayout from '@/components/AuthLayout'
import Button from '@/components/Button'
import Input from '@/components/Input'

export default function Login() {
  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre para jogar e salvar seu recorde"
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-semibold text-accent-2 hover:underline">
            Cadastre-se
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <Input label="E-mail" type="email" placeholder="voce@email.com" autoComplete="email" />
        <Input label="Senha" type="password" placeholder="••••••••" autoComplete="current-password" />
        <Button type="submit" className="w-full">
          Entrar
        </Button>
      </form>
    </AuthLayout>
  )
}
