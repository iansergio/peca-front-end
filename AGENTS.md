# Regras do Agente: Frontend E-commerce de Peças

## Stack Tecnológica Obrigatória
- Framework: Next.js 16 (App Router obrigatoriamente).
- Estilização: TailwindCSS v4.
- Componentes: shadcn/ui.
- Execução: imagem Docker com `output: "standalone"` e `node server.js`, levantada junto com o backend, o PostgreSQL e o Mailpit pelo `docker-compose.yml` do `peca-backend`. Sem serviços externos.

## Regras de Comportamento e Código
1. Leia sempre a documentação atualizada do Next.js 16 e do Tailwind v4 antes de implementar soluções complexas.
2. Todo o desenvolvimento deve ser "Mobile First". Teste os layouts simulando telas de celular.
3. Não crie componentes de UI do zero se o `shadcn/ui` possuir um equivalente. Use a CLI do shadcn para adicionar os componentes necessários.
4. O frontend não se conecta diretamente ao banco de dados. Ele deve apenas consumir as APIs REST fornecidas pelo backend via `fetch` ou Server Actions.
5. Em integrações simuladas ou em desenvolvimento, utilize dados mockados no formato JSON esperado da API.
6. A autenticação é Passwordless via OTP por email, em duas etapas: (1) o usuário informa o email e recebe o código; (2) o usuário informa o código OTP recebido. Não existem telas de senha nem de cadastro com senha.
7. O JWT retornado pelo backend após a validação do OTP é guardado num cookie `httpOnly` (nunca em `localStorage`/`sessionStorage`) e enviado ao backend como `Authorization: Bearer` a partir do servidor.

## Regras de Design (Conversão de E-commerce)
1. Exiba elementos de confiança: selos de compra segura, avaliações/reputação do vendedor, política de garantia/devolução e meios de contato visíveis.
2. Botões de ação (CTA) devem ser claros e inequívocos: um CTA primário por tela, texto orientado à ação (ex: "Comprar via WhatsApp"), alto contraste e área de toque mínima de 44×44px.
3. Todo elemento interativo deve dar feedback tátil/visual imediato: estados de `hover`, `active` (ex: leve redução de escala), `focus-visible`, `disabled` e de carregamento (spinner/skeleton) em ações assíncronas.

## Fluxo de Trabalho (Obrigatório)
1. Crie uma branch para cada tarefa (ex: `feat/vitrine-pecas`, `fix/botao-whatsapp`).
2. Utilize Conventional Commits em todas as mensagens de commit[cite: 2].
3. Comente o código em trechos com lógicas de negócio complexas[cite: 2].
4. Antes de finalizar, rode o lint e o build de produção (`npm run build`) para garantir que nada quebrou[cite: 2].
5. Atualize o `ROADMAP.md` seguindo a regra de honestidade[cite: 2].
6. Abra o Pull Request via GitHub CLI (`gh`) usando o template `.github/pull_request_template.md`[cite: 2].

## DESIGN SYSTEM STRICT MODE
1. Para qualquer estilização, componente ou cor, você DEVE consultar e seguir estritamente as regras definidas nA pasta docs/. Nunca invente cores fora da paleta oficial. Atualize o app/globals.css com variáveis CSS equivalentes ao Design System se for necessário para integrar com o shadcn."

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
