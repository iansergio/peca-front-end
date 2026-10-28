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
| `npm run start` | Sobe o build com `next start` |

## Variáveis de ambiente

| Variável | Obrigatória | Exemplo | Descrição |
| --- | --- | --- | --- |
| `API_URL` | Sim | `http://localhost:8080/api` | URL base da API, com `/api` e sem barra no final. Em produção, sempre HTTPS. Lida só no servidor. |

Em produção também entram `NODE_ENV`, `HOSTNAME` e `PORT`, configurados nas App Settings. Eles estão descritos no guia de deploy.

Nunca commite `.env.local` nem outros arquivos com segredos.

## Deploy

Azure App Service `peca-front-end` (Linux, Node 24), com o pacote `standalone` publicado a cada push na `main` pelo `.github/workflows/main_peca-front-end.yml`. Em todo PR para a `main`, o `.github/workflows/verificacao.yml` roda lint e build. Configuração, health check (`/api/saude`) e rollback estão em [docs/deploy-azure.md](docs/deploy-azure.md).
