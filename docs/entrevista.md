# Roteiro de entrevista: api_cadastro

Material para treinar com o Léo (Tech Lead). Responda **com as suas palavras**: estas são só a base. Fórmula: **o que fiz → onde guardei → como chego no resultado**.

## Pitch de 2 minutos
> "Fiz um projeto full stack de estudo para aprender **autenticação com JWT**. O backend é em **FastAPI com SQLite**; o frontend é **React com Vite**. A pessoa se cadastra, faz login e cai num **mini jogo de bolinha (Breakout)**, cuja pontuação é salva no banco e vira um **ranking**.
> No cadastro, a senha vira um **hash argon2**, nunca é guardada pura. No login, a API devolve um **access token de 15 minutos** e um **refresh token de 7 dias**. O front manda o access no cabeçalho `Authorization: Bearer`, e um **interceptor do Axios** renova o token sozinho quando recebe 401. O servidor valida o JWT pela **assinatura**, sem consultar o banco.
> A rota de pontuação **não recebe o id do usuário**: ela lê o dono do token. Também cuidei de **rate limit** no login, **CORS mínimo**, mensagens de erro genéricas e **74 testes** no backend mais 26 no motor do jogo.
> O que melhoraria: refresh em **cookie httpOnly**, **revogação** de token e validação da pontuação no servidor."

## Perguntas e respostas curtas

### JWT e autenticação
1. **O que é JWT e como o servidor valida sem consultar o banco?**
   É um texto em 3 partes (`header.payload.signature`). A assinatura é feita com a chave secreta. O servidor refaz a conta e confere: se bate, ninguém mexeu; também confere `exp`. Analogia: pulseira de festa, o segurança confere a pulseira, não a lista toda vez.
2. **Hash × criptografia × assinatura?**
   Hash: caminho de uma via (não volta); usado em senha. Criptografia: dá para voltar com a chave; esconde o conteúdo. Assinatura: não esconde, só prova que não foi alterado (é o que o JWT faz).
3. **Posso colocar dados sensíveis no payload?**
   Não. É só Base64: qualquer um lê (cole em jwt.io). Ele garante integridade, não sigilo.
4. **Por que access curto e refresh longo?**
   Se o access vazar, o estrago dura minutos. O refresh só serve para pedir um novo access, e o usuário não precisa logar toda hora. Analogia: ingresso do dia × cartão de membro.
5. **401 × 403?**
   401: "não sei quem você é" (sem token, expirado, inválido). 403: "sei quem você é, mas não pode".
6. **Por que a mesma mensagem para e-mail errado e senha errada? E o `DUMMY_HASH`?**
   Para não revelar quais e-mails existem. O `DUMMY_HASH` faz o servidor gastar o mesmo tempo mesmo quando o e-mail não existe (evita descobrir por tempo de resposta).
7. **O que é o ataque `alg: none`?**
   O atacante troca o algoritmo do header para "none" para o servidor aceitar sem assinatura. A defesa é passar uma **lista fixa de algoritmos** ao decodificar.
8. **Como invalidar um JWT antes de expirar?**
   No modelo stateless não dá. Soluções: lista de bloqueio/`jti` no banco, rotação do refresh, ou tokens bem curtos. É uma limitação que conheço do projeto.

### Segurança em geral
9. **Por que argon2 e não SHA-256?**
   SHA-256 é rápido demais (bom para força bruta). Argon2 é lento de propósito, usa memória e tem **sal**, então a mesma senha gera hashes diferentes.
10. **O que o CORS protege?**
    Impede que uma página de **outro site**, no navegador do usuário, leia respostas da API. Não protege contra `curl` ou Postman; quem protege a API é a autenticação.
11. **Como mitigou força bruta?**
    Limite de 5 falhas por minuto por IP+e-mail → 429 com `Retry-After`. Limite: está em memória; em produção usaria Redis.
12. **Onde guardou o token no front e quais os riscos?**
    Access em **memória**; refresh em `localStorage`. `localStorage` fica exposto a **XSS**. Cookie `httpOnly` resolve o XSS, mas traz **CSRF** (mitigado com `SameSite`) e exige mudar a API.
13. **A rota protegida do React é segurança?**
    Não, é UX. Quem protege os dados é a API (401). Um usuário pode burlar o front, nunca o servidor.

### Backend
14. **Model × schema?**
    Model = tabela do banco. Schema = contrato da API (o que entra e sai). Por isso a senha nunca vaza.
15. **Como a rota `/scores` sabe quem é o usuário sem receber o id?**
    `get_current_user` lê o JWT e devolve o usuário; o `user_id` vem dele. Aceitar `user_id` no corpo permitiria falsificar o dono.
16. **Por que checar e-mail duplicado no código e ter `UNIQUE` no banco?**
    O código dá a mensagem amigável; o `UNIQUE` garante a regra mesmo com duas requisições simultâneas (condição de corrida).
17. **Como montou o ranking com um resultado por jogador?**
    `GROUP BY user` com `MAX(pontos)`, ordenado do maior para o menor, `LIMIT 10`.
18. **Como testa sem tocar no banco real?**
    SQLite em memória + `dependency_overrides` do FastAPI trocando o `get_db`.

### Frontend e jogo
19. **Como o interceptor renova o token sem o usuário perceber? E se 5 requisições falharem juntas?**
    No 401 ele chama `/auth/refresh`, atualiza o access e **repete** a requisição. Com várias falhando juntas, todas esperam **uma só** renovação (*single-flight*).
20. **Como o app restaura a sessão ao recarregar?**
    O access só existe em memória e some. Se há refresh no `localStorage`, chama `/users/me`; recebe 401; o interceptor renova e repete. Sem código extra.
21. **Como funciona o game loop? Por que `requestAnimationFrame`?**
    A cada quadro: atualiza o mundo e redesenha. O navegador sincroniza com a tela (~60×/s) e pausa em aba escondida; `setInterval` não faz isso.
22. **O que é *delta time*?**
    Em vez de "5 px por quadro", "300 px por segundo × tempo desde o último quadro". Assim o jogo tem a mesma velocidade em 60 Hz ou 144 Hz.
23. **O que é *tunneling* e como evitou?**
    Bola rápida "pula" o tijolo entre dois quadros. Dividi cada quadro em **sub-passos** menores que o raio.
24. **Por que o estado do jogo fica em `useRef` e não em `useState`?**
    Muda 60×/s; `useState` re-renderizaria o React a cada quadro. O placar (HUD) só vira estado quando muda.
25. **O que acontece se não limpar o loop ao sair da tela?**
    Continua rodando "no vazio": gasta CPU e memória. O `useEffect` retorna uma função de limpeza (`cancelAnimationFrame` + remover eventos).
26. **É possível trapacear no ranking?**
    Sim: o jogo roda no navegador e o servidor só vê o número. Mitigação real: simular/validar a partida no servidor.

## O que eu melhoraria com mais tempo
1. Refresh em cookie `httpOnly` + `SameSite` e rotação/revogação de refresh.
2. Validar a pontuação no servidor.
3. Postgres + Alembic (migrações) e Docker.
4. Redis para o rate limit; limite também em `register` e `refresh`.
5. TypeScript e testes de tela (Testing Library) e E2E (Playwright).
6. Recuperação de senha e confirmação de e-mail.

## Pronto para treinar?
Peça ao Léo: *"Léo, me entreviste sobre o api_cadastro"*. Ele faz uma pergunta por vez, espera a sua resposta e só então corrige.
