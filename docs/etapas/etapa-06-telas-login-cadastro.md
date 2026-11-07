# Etapa 6 — Telas de login e cadastro

**Objetivo:** telas bonitas, responsivas e acessíveis, com validação no front e estados de carregamento/erro, ainda **sem API** (servidor simulado).
**Resultado:** layout dividido com marca e mini arena animada, validação ao sair do campo, mostrar/ocultar senha, barra de força, confirmação de senha, loading e mensagens de erro/sucesso.

## Conceitos novos
| Conceito | Analogia |
|---|---|
| **Formulário controlado** | o React é o dono do valor de cada campo (estado), não o navegador |
| **Campo "touched"** | só reclama do erro depois que o usuário passou pelo campo (sem gritar logo ao abrir) |
| **Custom hook** | receita reutilizável de estado e lógica (`useForm`) |
| **Validar no front × no back** | front = UX; back = segurança. O front pode ser burlado |
| **Mock** | servidor de mentirinha para ver os estados da tela sem backend |
| **Mobile-first / breakpoint** | desenhar para o celular e ampliar com `lg:` |

## Passo a passo (o que foi feito e como)

### 1. Validações (`lib/validators.js`)
Funções puras que devolvem a mensagem de erro (`''` = ok): `validarNome`, `validarEmail`, `validarSenha` (8 a 128, **igual ao backend**), `senhaObrigatoria` (login), `validarConfirmacao`. Por serem funções puras, são fáceis de testar.

`forcaSenha(senha)` pontua de 0 a 4 (tamanho, maiúscula+minúscula, número, símbolo). Senha com menos de 8 caracteres nunca passa de "Fraca".

### 2. Hook `useForm` (`lib/useForm.js`)
- Guarda `values` e `touched`.
- Calcula `errors` a partir de um objeto `validators` (declarado **fora** do componente para ficar estável).
- `bind('campo')` devolve `{name, value, onChange, onBlur, error}`, e o `error` só existe se o campo foi tocado. Uso: `<Input {...bind('email')} />`.
- `touchAll()` marca tudo ao tentar enviar (assim os erros aparecem todos de uma vez).

### 3. Componentes novos
| Componente | Função |
|---|---|
| `PasswordInput` | `Input` com botão olho (mostrar/ocultar), com `aria-label` e `aria-pressed` |
| `StrengthMeter` | 4 segmentos que acendem e mudam de cor + rótulo (`aria-live`) |
| `FormAlert` | aviso de erro (`role="alert"`) ou sucesso (`role="status"`) |
| `Input` (atualizado) | ganhou `suffix` (elemento dentro do campo) e `role="alert"` na mensagem de erro |

### 4. Layout (`AuthLayout`)
- Em telas grandes (`lg:`), duas colunas: **painel da marca** (logo, título com gradiente, mini arena com a bolinha quicando e a raquete) e o formulário.
- No celular, só o formulário, com o logo no topo.
- O formulário entra com animação `fade-up`. A bolinha é CSS puro: duas animações lineares com durações diferentes (3,1 s e 2,3 s) em eixos X e Y, o que dá o efeito de quicar.
- `prefers-reduced-motion` desativa as animações para quem pede isso no sistema.

### 5. Páginas
- **Login:** e-mail e senha obrigatória. Envia, mostra spinner e navega para `/jogo`. Mostra o banner verde "Conta criada!" quando vem do cadastro (`navigate('/login', { state })`).
- **Cadastro:** nome, e-mail, senha com barra de força, confirmação. Ao concluir, vai para o login.
- `noValidate` no `<form>`: desliga as bolhas nativas do navegador para usar as nossas mensagens.

### 6. Servidor simulado (`api/mock.js`)
Para ver os estados sem backend:
- Login com senha `errada123` → "E-mail ou senha inválidos".
- Cadastro com `existe@teste.com` → "E-mail já cadastrado".
- Atraso de 900 ms para exibir o loading.

**O arquivo será apagado na Etapa 7**, quando as telas chamarem a API real.

### 7. Verificação (no navegador)
| Cenário | Resultado |
|---|---|
| Enviar o cadastro vazio | os 4 erros aparecem de uma vez |
| Confirmação diferente | "As senhas não coincidem" ao sair do campo |
| Senha `Abcdef12!xyz` | barra cheia, "Força da senha: Forte" |
| Cadastro com `existe@teste.com` | alerta vermelho "E-mail já cadastrado" |
| Cadastro com e-mail novo | vai para `/login` com banner verde |
| Mobile 375×812 | layout de coluna única, sem rolagem horizontal |
| Console | sem erros |
| `npm run build` e `npm run lint` | ok, sem avisos |

## Decisões
- **Erro só depois de tocar o campo**: boa UX, não assusta quem acabou de abrir a tela.
- **Mesmas regras do backend** (8 a 128 caracteres), mas o back continua sendo a autoridade.
- **Hook próprio em vez de biblioteca** (React Hook Form): o projeto é de estudo e o hook mostra o conceito. Em projeto real, a biblioteca seria uma boa escolha.
- **Sem testes automatizados no front** por enquanto; as funções de `validators.js` são puras e seriam o primeiro alvo (Vitest) como melhoria.

## Próximo passo
Etapa 7: integrar o front com a API (cliente HTTP, `AuthContext`, interceptors e rota protegida).
