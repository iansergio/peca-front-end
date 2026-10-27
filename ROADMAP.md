# Roadmap: Frontend

## Regra de Preenchimento
- [ ] Pendente
- [-] Implementado, build passando, mas aguardando teste humano em tela real.
- [x] Testado pelo humano no navegador/celular e aprovado.

## Fase 1: Setup e Infraestrutura
- [x] Inicializar projeto Next.js 16 com Tailwind v4.
- [x] Configurar shadcn/ui e paleta de cores base do e-commerce.
- [x] Criar layout base (Header, Footer e container mobile).
- [-] Favicon e ícones com o símbolo da logo (`favicon.ico`, `icon.svg`, `apple-icon.png` e manifest com ícones 192/512).

## Fase 2: Telas de Usuário
- [-] Tela de Login OTP — Etapa 1: inserir email e solicitar envio do código.
- [-] Tela de Login OTP — Etapa 2: inserir o código OTP recebido por email (com reenvio do código).
- [-] Menu da conta e "Sair" no header adaptados ao fluxo OTP.
- [-] Tela de Cadastro sem senha (Nome, Email e WhatsApp) com confirmação do email por OTP.
- [-] Interface de Perfil do Usuário (`/perfil`: nome e WhatsApp editáveis, email só leitura) e link "Meu perfil" no menu da conta.
- [-] Aba "Meus anúncios" no perfil (`/perfil?aba=anuncios`) com link no menu da conta: lista as peças da pessoa com "Editar".
- [ ] "Meus anúncios" com endpoint próprio no backend: hoje o front filtra `GET /pecas` pelo `vendedor.id` (não escala com paginação).

## Fase 3: Vitrine e Fluxo de Venda
- [x] Tela da Vitrine (Listagem de peças com grid responsivo).
- [x] Componente de Card de Peça (Foto, Título, Preço e Modelo do Celular).
- [-] Tela de Detalhes da Peça (`/pecas/[id]`, abre em nova aba pelo "Ver detalhes" do cartão; WhatsApp como CTA laranja da página).
- [ ] Detalhes da peça com várias fotos (galeria): o backend guarda só uma `imagemUrl` por peça.
- [ ] Localização do anunciante (cidade) e selo "técnico verificado": o backend ainda não tem esses dados.
- [ ] Data do anúncio ("anunciada há X dias"): o backend não devolve data de criação.
- [ ] Frete (grátis / retirada) no anúncio: o backend ainda não tem o campo.
- [ ] Vários modelos compatíveis por peça: hoje `modeloCelular` é um texto único.
- [x] Integração do botão "Comprar via WhatsApp" (gerando link dinâmico: `wa.me/NUMERO?text=MENSAGEM`).
- [-] Refatoração da Landing Page: Hero Banner promocional.
- [-] Refatoração da Landing Page: Sub-header (segunda barra de navegação) de categorias.
- [-] Refatoração da Landing Page: Grid atualizado dos cards de peças conforme o novo mockup.
- [-] Header no padrão do DS (logo PEÇA, busca, "Explorar categorias", "Entrar" e "Anunciar peça").
- [-] Página `/pecas` com busca e filtro por categoria (filtrados no frontend: a API só filtra por modelo/preço).
- [ ] Selos de condição (Nova/Original/Retirada/Usada) com dados reais: o cartão já exibe, mas o backend ainda não tem o campo `condicao`.

## Fase 4: Integração com Backend
- [x] Conectar listagem de peças com a API REST.
- [x] Conectar criação de anúncio com a API REST e upload de fotos.
- [-] Tela de edição do anúncio (`/pecas/[id]/editar`): dados pré-preenchidos, troca opcional da foto com prévia (`PUT /pecas/{id}` + `POST /pecas/{id}/imagem`), exclusão com confirmação (`DELETE /pecas/{id}`) e rota protegida no Proxy.
- [-] Autenticação Passwordless OTP via API (solicitar código por email e validar código), JWT em cookie httpOnly enviado como `Bearer` na criação de anúncio.
- [-] Integração v2 com o backend: cliente HTTP único (`lib/api/cliente.ts`), `nome` só no cadastro, login com resposta neutra, limite de pedidos (429 + Retry-After) com reenvio travado, `GET /usuarios/me`, `PUT /usuarios/{id}` sem email e `whatsapp` obrigatório ao anunciar (pré-preenchido do perfil).
- [-] Login de email sem conta respondido pelo backend sem erro (`peca-backend#17`: `nome` só no cadastro, email sem conta responde 200 sem enviar código); removido o contorno que tratava o 400 como envio neutro.
- [-] Contrato sincronizado com o backend: `vendedor.whatsapp` pode vir nulo (só dígitos, sem DDI) e o formulário de anúncio valida os mesmos limites do `PecaRequest` (título 120, descrição 2000, modelo 80, preço até 10 dígitos inteiros).

## Fase 5: Deploy
- [-] Deploy no Azure Container Apps (`peca-web`): `Dockerfile` com build `standalone`, workflow com lint/tsc/build em PR e imagem no GHCR + `az containerapp update` por OIDC na `main`. O workflow (`.github/workflows/deploy.yml`) está todo comentado de propósito: hoje não roda CI nem deploy automático.
- [-] Rota de health check `/api/saude` (dinâmica, sem depender do backend).
- [-] Documentação do deploy (`docs/deploy-azure.md`: configuração do Container App, variáveis, probes, rede e rollback) e README em português.
- [ ] Validar o deploy no Container App real com o backend em produção.
