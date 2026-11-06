// Transforma um erro do Axios em uma frase amigável para mostrar ao usuário.
export function mensagemDeErro(erro) {
  // Sem resposta = servidor fora do ar, rede caiu ou CORS bloqueou.
  if (!erro.response) return 'Não foi possível conectar ao servidor. Tente novamente.'

  const { status, data } = erro.response
  // Erros nossos (401, 409, 429...) trazem `detail` como texto.
  if (typeof data?.detail === 'string') return data.detail
  if (status === 422) return 'Confira os dados informados.'
  return 'Algo deu errado. Tente novamente.'
}
