# Decisões técnicas

Registro do **porquê** de cada escolha. É o material para responder "por que você usou X?" na entrevista.

| # | Decisão | Motivo | Alternativa e quando usaria |
|---|---|---|---|
| 1 | **FastAPI** | Validação automática (Pydantic), docs em `/docs`, tipagem, rápido. | Django, se precisasse de admin e ORM prontos. |
| 2 | **SQLite + SQLAlchemy** | Zero configuração para estudo; o ORM permite trocar de banco mudando a `DATABASE_URL`. | Postgres em produção. |
| 3 | **JWT** (objetivo do estudo) | Autenticação stateless: o servidor valida pela assinatura, sem consultar sessão. | Sessão em cookie, mais simples e fácil de revogar. |
| 4 | **PyJWT** | Biblioteca enxuta e mantida para gerar/validar JWT. | `python-jose` (menos mantida). |
| 5 | **argon2 via pwdlib** | Algoritmo de hash recomendado hoje; resistente a GPU. | bcrypt (também aceitável). `passlib` foi evitada por estar sem manutenção. |
| 6 | **Access (15 min) + refresh (7 dias)** | Limita o dano se o access vazar, sem deslogar o usuário toda hora. | Só access longo (mais simples, menos seguro). |
| 7 | **React + Vite** | Build rápido, padrão de mercado. | Next.js, se precisasse de SSR. |
| 8 | **JavaScript (não TypeScript)** | Foco do estudo é JWT e a API; menos atrito. | Migrar para TS depois é um bom "próximo passo". |
| 9 | **Tailwind CSS 4** | Visual moderno e consistente com tokens (`@theme`), sem escrever CSS do zero. | CSS Modules. |
| 10 | **Axios** | Interceptors facilitam anexar token e renovar no 401. | `fetch` nativo com wrapper. |
| 11 | **Canvas puro** para o jogo | Aprender o game loop (`requestAnimationFrame`), física e colisão sem biblioteca. | Phaser, se o jogo crescesse. |
| 12 | **Monorepo** (`backend/` + `frontend/`) | Um repositório conta a história completa do projeto. | Repositórios separados em times grandes. |
| 13 | **Estrutura em camadas no back** | Rotas finas, regra em módulos próprios: fácil de testar e crescer. | Tudo em `main.py` (rápido, mas não escala). |

## Em aberto (decidir na Etapa 7)
Onde guardar o token no front: memória, `localStorage` ou cookie `httpOnly`. Cada um troca risco de XSS por risco de CSRF. Será discutido com o Léo antes de implementar.
