// Tela de cadastro (Etapa 6): validação, força da senha e confirmação, servidor SIMULADO.
// Na Etapa 7, `fakeRegister` troca pela chamada real à API.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fakeRegister } from '@/api/mock'
import AuthLayout from '@/components/AuthLayout'
import Button from '@/components/Button'
import FormAlert from '@/components/FormAlert'
import Input from '@/components/Input'
import PasswordInput from '@/components/PasswordInput'
import StrengthMeter from '@/components/StrengthMeter'
import { useForm } from '@/lib/useForm'
import { validarConfirmacao, validarEmail, validarNome, validarSenha } from '@/lib/validators'

const validators = {
  nome: validarNome,
  email: validarEmail,
  senha: validarSenha,
  confirmar: validarConfirmacao,
}

export default function Cadastro() {
  const navigate = useNavigate()
  const { values, bind, touchAll, isValid } = useForm(
    { nome: '', email: '', senha: '', confirmar: '' },
    validators,
  )
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    touchAll()
    if (!isValid) return

    setCarregando(true)
    try {
      await fakeRegister(values)
      navigate('/login', { state: { cadastrado: true } })
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

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
      <form className="space-y-5" onSubmit={enviar} noValidate>
        <FormAlert>{erro}</FormAlert>
        <Input label="Nome" placeholder="Seu nome" autoComplete="name" {...bind('nome')} />
        <Input
          label="E-mail"
          type="email"
          placeholder="voce@email.com"
          autoComplete="email"
          {...bind('email')}
        />
        <div className="space-y-3">
          <PasswordInput
            label="Senha"
            placeholder="Mínimo de 8 caracteres"
            autoComplete="new-password"
            {...bind('senha')}
          />
          <StrengthMeter senha={values.senha} />
        </div>
        <PasswordInput
          label="Confirmar senha"
          placeholder="Repita a senha"
          autoComplete="new-password"
          {...bind('confirmar')}
        />
        <Button type="submit" loading={carregando} className="w-full">
          {carregando ? 'Criando...' : 'Criar conta'}
        </Button>
      </form>
    </AuthLayout>
  )
}
