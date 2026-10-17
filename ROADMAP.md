# Roadmap: Frontend

## Regra de Preenchimento
- [ ] Pendente
- [-] Implementado, build passando, mas aguardando teste humano em tela real[cite: 2].
- [x] Testado pelo humano no navegador/celular e aprovado[cite: 2].

## Fase 1: Setup e Infraestrutura
- [-] Inicializar projeto Next.js 16 com Tailwind v4.
- [-] Configurar shadcn/ui e paleta de cores base do e-commerce.
- [-] Criar layout base (Header, Footer e container mobile).

## Fase 2: Telas de Usuário (Mockadas)
- [ ] Interface de Login / Cadastro.
- [ ] Interface de Perfil do Usuário (com campo para número de WhatsApp).

## Fase 3: Vitrine e Fluxo de Venda
- [ ] Tela da Vitrine (Listagem de peças com grid responsivo).
- [ ] Componente de Card de Peça (Foto, Título, Preço e Modelo do Celular).
- [ ] Tela de Detalhes da Peça.
- [ ] Integração do botão "Comprar via WhatsApp" (gerando link dinâmico: `wa.me/NUMERO?text=MENSAGEM`).

## Fase 4: Integração com Backend
- [ ] Conectar listagem de peças com a API REST.
- [ ] Conectar criação de anúncio com a API REST e upload de fotos.
