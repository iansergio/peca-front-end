# Regras do Agente: Frontend E-commerce de Peças

## Stack Tecnológica Obrigatória
- Framework: Next.js 16 (App Router obrigatoriamente).
- Estilização: TailwindCSS v4.
- Componentes: shadcn/ui.
- Deploy: Vercel.

## Regras de Comportamento e Código
1. Leia sempre a documentação atualizada do Next.js 16 e do Tailwind v4 antes de implementar soluções complexas.
2. Todo o desenvolvimento deve ser "Mobile First". Teste os layouts simulando telas de celular.
3. Não crie componentes de UI do zero se o `shadcn/ui` possuir um equivalente. Use a CLI do shadcn para adicionar os componentes necessários.
4. O frontend não se conecta diretamente ao banco de dados. Ele deve apenas consumir as APIs REST fornecidas pelo backend via `fetch` ou Server Actions.
5. Em integrações simuladas ou em desenvolvimento, utilize dados mockados no formato JSON esperado da API.

## Fluxo de Trabalho (Obrigatório)
1. Crie uma branch para cada tarefa (ex: `feat/vitrine-pecas`, `fix/botao-whatsapp`).
2. Utilize Conventional Commits em todas as mensagens de commit[cite: 2].
3. Comente o código em trechos com lógicas de negócio complexas[cite: 2].
4. Antes de finalizar, rode o lint e o build de produção (`npm run build`) para garantir que nada quebrou[cite: 2].
5. Atualize o `ROADMAP.md` seguindo a regra de honestidade[cite: 2].
6. Abra o Pull Request via GitHub CLI (`gh`) usando o template `.github/pull_request_template.md`[cite: 2].
