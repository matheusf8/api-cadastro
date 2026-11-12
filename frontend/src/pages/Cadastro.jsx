// Tela de cadastro: validação, força da senha e confirmação + chamada real à API.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { mensagemDeErro } from '@/api/errors'
import { useAuth } from '@/auth/useAuth'
import AuthLayout from '@/components/AuthLayout'
import Button from '@/components/Button'
import FormAlert from '@/components/FormAlert'
import Input from '@/components/Input'
import PasswordInput from '@/components/PasswordInput'
import StrengthMeter from '@/components/StrengthMeter'
import { AVISO_SERVIDOR_ACORDANDO, useAvisoDemora } from '@/lib/useAvisoDemora'
import { useForm } from '@/lib/useForm'
import {
  validarConfirmacao,
  validarConvite,
  validarEmail,
  validarNome,
  validarSenha,
} from '@/lib/validators'

// Em produção o cadastro é só para convidados: a API exige o código (INVITE_CODE).
// Esta flag só decide se o campo APARECE; quem confere de verdade é o servidor.
const EXIGE_CONVITE = import.meta.env.VITE_EXIGE_CONVITE === 'true'

const validators = {
  nome: validarNome,
  email: validarEmail,
  senha: validarSenha,
  confirmar: validarConfirmacao,
  ...(EXIGE_CONVITE && { convite: validarConvite }),
}

export default function Cadastro() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { values, bind, touchAll, isValid } = useForm(
    { nome: '', email: '', senha: '', confirmar: '', convite: '' },
    validators,
  )
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const demorando = useAvisoDemora(carregando)

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    touchAll()
    if (!isValid) return

    setCarregando(true)
    try {
      await register(values)
      navigate('/login', { state: { cadastrado: true } })
    } catch (err) {
      setErro(mensagemDeErro(err))
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
        {demorando && <FormAlert tipo="sucesso">{AVISO_SERVIDOR_ACORDANDO}</FormAlert>}
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
        {EXIGE_CONVITE && (
          <Input
            label="Código de convite"
            placeholder="Quem te convidou tem o código"
            autoComplete="off"
            {...bind('convite')}
          />
        )}
        <Button type="submit" loading={carregando} className="w-full">
          {carregando ? 'Criando...' : 'Criar conta'}
        </Button>
      </form>
    </AuthLayout>
  )
}
