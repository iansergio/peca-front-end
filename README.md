# PEÇA — Front-end

Vitrine e anúncios de peças de celular. Feito com Next.js 16 (App Router, Cache Components), Tailwind v4 e shadcn/ui.

O front fala com a [API do PEÇA](https://github.com/iansergio/peca-backend) **só pelo servidor** (Server Components e Server Actions). O JWT fica num cookie httpOnly, e o navegador nunca chama o backend, então não é preciso configurar CORS.

## Rodando com Docker (recomendado)

O front sobe junto com a API, o PostgreSQL e o Mailpit pelo `docker-compose.yml` do [peca-backend](https://github.com/iansergio/peca-backend). Com os dois repositórios lado a lado (`peca-backend/` e `peca-front-end/`):

```bash
cd ../peca-backend
docker compose up --build   # front em http://localhost:3000, emails (códigos OTP) em http://localhost:8025
```

## Rodando com `npm run dev`

Requisitos: Node.js 24 e o backend rodando (por padrão em `http://localhost:8080`).

```bash
npm ci
cp .env.example .env.local   # ajuste o API_URL se precisar
npm run dev                  # http://localhost:3000
```

Outros comandos:

| Comando | O que faz |
| --- | --- |
| `npm run lint` | ESLint |
| `npm run build` | Build de produção (gera `.next/standalone`) |
| `docker build -t peca-front-end .` | Imagem Docker (a mesma do Compose) |
| `npm run start` | Sobe o build com `next start` |

## Variáveis de ambiente

| Variável | Obrigatória | Exemplo | Descrição |
| --- | --- | --- | --- |
| `API_URL` | Sim | `http://localhost:8080/api` | URL base da API, com `/api` e sem barra no final. Lida só no servidor. No Compose é `http://api:8080/api`. |

Na imagem Docker, `NODE_ENV`, `HOSTNAME=0.0.0.0` e `PORT=3000` já vêm definidos.

## Fotos dos anúncios

O backend grava as fotos no disco e devolve `imagemUrl` como `/imagens/{pasta}/{arquivo}`. A rota `app/imagens/[pasta]/[arquivo]/route.ts` repassa o pedido para `GET /api/imagens/...` do backend, então o navegador nunca fala com a API e o `next/image` otimiza as fotos como imagens locais.
