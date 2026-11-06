// Validações do formulário. Cada função devolve a mensagem de erro ('' = válido).
// Atenção: validar no front é só UX. A API valida de novo (nunca confie no cliente).

export const validarNome = (v) => {
  const nome = v.trim()
  if (!nome) return 'Informe seu nome'
  if (nome.length < 2) return 'Nome muito curto'
  if (nome.length > 80) return 'Máximo de 80 caracteres'
  return ''
}

export const validarEmail = (v) => {
  const email = v.trim()
  if (!email) return 'Informe seu e-mail'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'E-mail inválido'
  return ''
}

export const validarSenha = (v) => {
  if (!v) return 'Informe uma senha'
  if (v.length < 8) return 'Use pelo menos 8 caracteres'
  if (v.length > 128) return 'Máximo de 128 caracteres'
  return ''
}

// Login: só exige que algo foi digitado (quem decide se está certa é o servidor).
export const senhaObrigatoria = (v) => (v ? '' : 'Informe sua senha')

export const validarConfirmacao = (v, todos) => {
  if (!v) return 'Confirme sua senha'
  if (v !== todos.senha) return 'As senhas não coincidem'
  return ''
}

const ROTULOS = ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte']

// Pontua de 0 a 4: tamanho, maiúscula+minúscula, número, símbolo.
export function forcaSenha(senha) {
  if (!senha) return { nivel: 0, rotulo: '' }
  let pontos = 0
  if (senha.length >= 8) pontos++
  if (senha.length >= 12) pontos++
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) pontos++
  if (/\d/.test(senha)) pontos++
  if (/[^A-Za-z0-9]/.test(senha)) pontos++
  // Senha curta nunca passa de "Fraca", mesmo com variedade de caracteres.
  const nivel = senha.length < 8 ? Math.min(pontos, 1) : Math.min(pontos - 1, 4)
  return { nivel: Math.max(nivel, 0), rotulo: ROTULOS[Math.max(nivel, 0)] }
}
