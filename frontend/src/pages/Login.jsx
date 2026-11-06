// Tela de login: validação no front + chamada real à API via AuthContext.
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { mensagemDeErro } from '@/api/errors'
import { useAuth } from '@/auth/useAuth'
import AuthLayout from '@/components/AuthLayout'
import Button from '@/components/Button'
import FormAlert from '@/components/FormAlert'
import Input from '@/components/Input'
import PasswordInput from '@/components/PasswordInput'
import { useForm } from '@/lib/useForm'
import { senhaObrigatoria, validarEmail } from '@/lib/validators'

const validators = { email: validarEmail, senha: senhaObrigatoria }

export default function Login() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { login } = useAuth()
  const { values, bind, touchAll, isValid } = useForm({ email: '', senha: '' }, validators)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    touchAll()
    if (!isValid) return

    setCarregando(true)
    try {
      await login(values)
      // Volta para a página que a pessoa tentou abrir (ProtectedRoute), ou vai ao jogo.
      navigate(state?.from?.pathname ?? '/jogo', { replace: true })
    } catch (err) {
      setErro(mensagemDeErro(err))
    } finally {
      setCarregando(false)
    }
  }

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
      <form className="space-y-5" onSubmit={enviar} noValidate>
        {state?.cadastrado && <FormAlert tipo="sucesso">Conta criada! Entre para continuar.</FormAlert>}
        <FormAlert>{erro}</FormAlert>
        <Input
          label="E-mail"
          type="email"
          placeholder="voce@email.com"
          autoComplete="email"
          {...bind('email')}
        />
        <PasswordInput
          label="Senha"
          placeholder="Sua senha"
          autoComplete="current-password"
          {...bind('senha')}
        />
        <Button type="submit" loading={carregando} className="w-full">
          {carregando ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </AuthLayout>
  )
}
