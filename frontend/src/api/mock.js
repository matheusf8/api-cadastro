// SIMULAÇÃO de servidor (Etapa 6). Será apagada na Etapa 7, quando as telas
// passarem a chamar a API de verdade. Serve para ver loading e erros no visual.
const esperar = (ms) => new Promise((r) => setTimeout(r, ms))

export async function fakeLogin({ senha }) {
  await esperar(900)
  if (senha === 'errada123') throw new Error('E-mail ou senha inválidos')
}

export async function fakeRegister({ email }) {
  await esperar(900)
  if (email.trim().toLowerCase() === 'existe@teste.com') throw new Error('E-mail já cadastrado')
}
