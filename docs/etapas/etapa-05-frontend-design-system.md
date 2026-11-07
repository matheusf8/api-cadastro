# Etapa 5 — Frontend base e design system

**Objetivo:** criar a base visual reutilizável (tokens, componentes) e o mapa de rotas.
**Resultado:** rotas `/login`, `/cadastro`, `/jogo` navegando, com `Input`, `Button`, `Card`, fundo animado e layout de autenticação.

## Conceitos novos
| Conceito | Analogia |
|---|---|
| **Design tokens** | a paleta de tintas do projeto: cores/fonte definidas uma vez e usadas em todo lugar |
| **Componente** | peça de Lego reutilizável |
| **React Router** | o mapa que liga cada endereço a uma tela |
| **Props** | os "botões de ajuste" de um componente (`variant`, `loading`, `error`...) |
| **Acessibilidade (a11y)** | o site funcionar com teclado e leitor de tela |

## Passo a passo (o que foi feito e como)

### 1. Tokens de design (`src/index.css`)
No bloco `@theme` do Tailwind 4 defini cores (`bg`, `surface`, `surface-2`, `border`, `accent` violeta, `accent-2` ciano, `ok`, `danger`), a fonte **Inter** e as animações `float`. Cada token vira classe automática: `bg-surface`, `text-accent`, `animate-float`.
Também adicionei `prefers-reduced-motion`: quem desativa animações no sistema não as vê.

### 2. `index.html`
Idioma `pt-BR`, título "Rebote · Cadastro", `theme-color` e a fonte Inter via Google Fonts (com `preconnect`).

### 3. Componentes (`src/components/`)
| Componente | O que faz |
|---|---|
| `Background` | fundo fixo com duas "auroras" desfocadas que flutuam e uma grade sutil com máscara radial |
| `Card` | cartão "vidro" (translúcido, `backdrop-blur`, borda fina) |
| `Button` | variantes `primary` (gradiente) e `ghost`; prop `loading` mostra spinner e **desativa** o botão (evita duplo envio); foco visível |
| `Input` | `label` + campo + `hint`/`error`; usa `useId` para ligar `label/htmlFor`, `aria-invalid` e `aria-describedby` |
| `AuthLayout` | moldura das telas de auth: fundo + logo + título + card + rodapé |

`src/lib/cn.js`: pequena função para juntar classes condicionais (`cn("a", cond && "b")`).

### 4. Rotas (`App.jsx` + `main.jsx`)
`BrowserRouter` em `main.jsx` e, no `App.jsx`:
| Rota | Tela |
|---|---|
| `/` | redireciona para `/login` |
| `/login` | `Login` |
| `/cadastro` | `Cadastro` |
| `/jogo` | `Jogo` (placeholder; vira protegida na Etapa 7) |
| `/status` | `Status` (checagem da API da Etapa 0) |
| `*` | `NotFound` (404) |

### 5. Páginas-esqueleto
`Login` e `Cadastro` usam `AuthLayout` + `Input` + `Button`, com links entre si (`<Link>`, sem recarregar a página). Ainda **sem validação nem API**: isso é das Etapas 6 e 7. `Jogo` e `NotFound` são simples.

### 6. Verificação
| Checagem | Resultado |
|---|---|
| `npm run build` | ok |
| `npm run lint` | sem avisos |
| Navegador: `/login` e `/cadastro` | telas renderizam com fundo animado, card e gradiente, sem erros no console |
| `/` | redireciona para `/login` |
| `/nao-existe` | mostra o 404 |
| `/jogo` | mostra o placeholder |
| Link "Cadastre-se" | aponta para `/cadastro` |

## Decisões
- **Tokens em vez de cores soltas**: mudar a identidade visual é editar um arquivo.
- **Componentes sem conhecimento de API**: só recebem props. Facilita reaproveitar e testar.
- **Acessibilidade desde já** (label ligada ao campo, foco visível, `aria-*`), mais barato que consertar depois.
- **`/status` mantida** como ferramenta de diagnóstico do ambiente.

## Próximo passo
Etapa 6: telas de login e cadastro com visual final e validação no front.
