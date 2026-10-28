# syntax=docker/dockerfile:1

# Debian slim (glibc): o `sharp` do next/image é instalado pelo npm para glibc.
ARG NODE_IMAGE=node:24.22.1-bookworm-slim

# ---- Dependências: só refeita quando package.json ou package-lock.json mudam ----
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build: gera .next/standalone (output: "standalone" no next.config.ts) ----
FROM ${NODE_IMAGE} AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# `public` não vai para o git quando vazia; o COPY do runtime precisa dela.
RUN mkdir -p public && npm run build

# ---- Runtime: só o server.js e os node_modules rastreados, usuário sem privilégios ----
FROM ${NODE_IMAGE}
WORKDIR /app

# Sem segredos aqui: API_URL entra por variável de ambiente em runtime.
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

# O usuário `node` já existe na imagem oficial. O .next precisa ser dele: o
# Next grava o cache de imagens e de renderização em .next/cache.
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

USER node
EXPOSE 3000

# Health check em /api/saude. Usa o fetch do Node: a imagem slim não tem curl nem wget.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/api/saude').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"

CMD ["node", "server.js"]
