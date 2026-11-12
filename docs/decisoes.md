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
| 14 | **Access em memória + refresh em `localStorage`** (Etapa 7) | O access (curto) nunca fica em disco; o refresh persiste para manter o login ao recarregar. | Cookie `httpOnly` + `SameSite` para o refresh: elimina o risco de XSS, mas exige a API setar o cookie e tratar CSRF. É a principal melhoria planejada. |
| 15 | **Interceptor com single-flight** | Renova o token uma vez só, mesmo com várias requisições falhando juntas. | Renovar de forma proativa por timer antes de expirar. |
| 16 | **Context API** para autenticação | Estado global simples, sem dependência extra. | Zustand/Redux em app maior. |
| 17 | **Motor do jogo separado do React** (`engine.js` puro) | Regras testáveis sem navegador; o desenho e o componente podem mudar sem quebrar a física. | Lógica dentro do componente (mais rápido de escrever, quase impossível de testar). |
| 18 | **Vitest** só para o motor | A lógica densa (colisão, pontos, níveis) é onde bugs se escondem. | Testar também as telas com Testing Library (melhoria futura). |
| 19 | **CORS mínimo e sem credenciais** (Etapa 10) | Uma origem, só GET/POST e dois cabeçalhos: menor privilégio. Token no cabeçalho, não em cookie, então credenciais não são necessárias. | `allow_*=["*"]` (mais fácil, mais exposto). |
| 20 | **API recusa subir em produção com `SECRET_KEY` fraca** | Chave padrão está no código público: qualquer um forjaria tokens. Fail fast. | Só avisar no log (fácil de ignorar). |
| 21 | **Postgres (Neon) em produção, SQLite local** (deploy) | O disco do Render grátis é apagado a cada reinício: o SQLite perderia contas e ranking. Com o ORM, trocar de banco é só mudar a `DATABASE_URL`. | Disco persistente pago, ou o Postgres grátis do Render (expira em 30 dias). |
| 22 | **Código de convite + teto de contas** | O site fica público, mas o jogo é para até 5 convidados. O código (`INVITE_CODE`) barra estranhos; o teto (`MAX_USERS`) segura mesmo se o código vazar. Comparação em tempo constante (`hmac.compare_digest`). | Lista de e-mails permitidos; fechar o cadastro manualmente. |
| 23 | **`pool_pre_ping` na conexão** | O banco na nuvem dorme e derruba conexões antigas; testar antes de usar evita erro na primeira requisição. | Tratar o erro e tentar de novo na mão. |
