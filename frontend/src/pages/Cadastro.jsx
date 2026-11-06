// Esqueleto da tela de cadastro (Etapa 5). Validação e visual final: Etapa 6. API: Etapa 7.
import { Link } from 'react-router-dom'
import AuthLayout from '@/components/AuthLayout'
import Button from '@/components/Button'
import Input from '@/components/Input'

export default function Cadastro() {
  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Leva menos de um minuto"
      footer={
        <>
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold text-accent-2 hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <Input label="Nome" placeholder="Seu nome" autoComplete="name" />
        <Input label="E-mail" type="email" placeholder="voce@email.com" autoComplete="email" />
        <Input
          label="Senha"
          type="password"
          placeholder="Mínimo de 8 caracteres"
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full">
          Criar conta
        </Button>
      </form>
    </AuthLayout>
  )
}
