# Roadmap: Frontend

## Regra de Preenchimento
- [ ] Pendente
- [-] Implementado, build passando, mas aguardando teste humano em tela real[cite: 2].
- [x] Testado pelo humano no navegador/celular e aprovado[cite: 2].

## Fase 1: Setup e Infraestrutura
- [x] Inicializar projeto Next.js 16 com Tailwind v4.
- [x] Configurar shadcn/ui e paleta de cores base do e-commerce.
- [x] Criar layout base (Header, Footer e container mobile).

## Fase 2: Telas de Usuário
- [-] Tela de Login OTP — Etapa 1: inserir email e solicitar envio do código.
- [-] Tela de Login OTP — Etapa 2: inserir o código OTP recebido por email (com reenvio do código).
- [-] Menu da conta e "Sair" no header adaptados ao fluxo OTP.
- [-] Tela de Cadastro sem senha (Nome, Email e WhatsApp) com confirmação do email por OTP.
- [ ] Interface de Perfil do Usuário (com campo para número de WhatsApp).

## Fase 3: Vitrine e Fluxo de Venda
- [x] Tela da Vitrine (Listagem de peças com grid responsivo).
- [x] Componente de Card de Peça (Foto, Título, Preço e Modelo do Celular).
- [ ] Tela de Detalhes da Peça.
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
- [-] Autenticação Passwordless OTP via API (solicitar código por email e validar código), JWT em cookie httpOnly enviado como `Bearer` na criação de anúncio.
