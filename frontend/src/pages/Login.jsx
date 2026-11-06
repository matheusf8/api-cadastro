// Tela de login (Etapa 6): validação + estados de loading/erro, ainda com servidor SIMULADO.
// Na Etapa 7, `fakeLogin` troca pela chamada real à API via AuthContext.
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { fakeLogin } from '@/api/mock'
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
      await fakeLogin(values)
      navigate('/jogo')
    } catch (err) {
      setErro(err.message)
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
