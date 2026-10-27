# PEÇA — Front-end

Vitrine e anúncios de peças de celular. Feito com Next.js 16 (App Router, Cache Components), Tailwind v4 e shadcn/ui.

O front fala com a [API do PEÇA](https://github.com/iansergio/peca-backend) **só pelo servidor** (Server Components e Server Actions). O JWT fica num cookie httpOnly, e o navegador nunca chama o backend, então não é preciso configurar CORS.

## Rodando localmente

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
| `docker build -t peca-front-end .` | Imagem de produção (a mesma do deploy) |
| `npm run start` | Sobe o build com `next start` |

## Variáveis de ambiente

| Variável | Obrigatória | Exemplo | Descrição |
| --- | --- | --- | --- |
| `API_URL` | Sim | `http://localhost:8080/api` | URL base da API, com `/api` e sem barra no final. Em produção, sempre HTTPS. Lida só no servidor. |

Na imagem Docker, `NODE_ENV`, `HOSTNAME` e `PORT` já vêm definidos. Eles estão descritos no guia de deploy.

Nunca commite `.env.local` nem outros arquivos com segredos.

## Deploy

Azure Container Apps, com imagem no GHCR. O workflow de deploy automático (`.github/workflows/deploy.yml`) está comentado no momento, então não há CI nem deploy a cada push na `main`. Configuração, health check (`/api/saude`) e rollback estão em [docs/deploy-azure.md](docs/deploy-azure.md).

Produção: https://peca-web.thankfulglacier-8a723f55.canadacentral.azurecontainerapps.io
