# Deploy no Azure Container Apps

O front roda no Container App **`peca-web`**, no mesmo ambiente do backend (`peca-env`, resource group `rg-peca-app`, Canada Central, assinatura `d1f4984b-…`).

- URL: https://peca-web.thankfulglacier-8a723f55.canadacentral.azurecontainerapps.io
- A imagem vem do [`Dockerfile`](../Dockerfile): build com `output: "standalone"`, e o runtime roda só `node server.js` com os `node_modules` rastreados, como usuário `node`, na porta 3000.

## Como o deploy acontece

O workflow [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) tem dois jobs:

1. **`verificacao`** (todo PR para a `main` e todo push): `npm ci`, `npm run lint`, `npx tsc --noEmit` e `npm run build`.
2. **`deploy`** (só em push na `main` ou disparo manual a partir da `main`):
   1. build da imagem;
   2. push para `ghcr.io/iansergio/peca-front-end:<sha>` e `:latest`;
   3. login no Azure por OIDC;
   4. `az containerapp update --image …:<sha>`.

Cada deploy cria uma revisão nova. Como o modo é *Single*, o tráfego passa para ela quando as probes ficam verdes.

**Login no Azure (OIDC, sem senha):**
- Segredos do repositório: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID` e `AZURE_SUBSCRIPTION_ID`.
- Identidade: `oidc-msi-918b` (resource group `rg-peca-app`).
- Credencial federada com subject `repo:iansergio@80067694/peca-front-end@1422292249:ref:refs/heads/main`. Por isso o deploy só funciona disparado a partir da `main`.
- Permissões: **Contributor só no `peca-web`** e **Reader no `peca-env`**.

> Para usar um `environment:` no job (aprovação manual, por exemplo), crie antes outra credencial federada com o subject `...:environment:<nome>`. Sem ela, o login falha.

## Configuração atual do Container App

| Item | Valor |
| --- | --- |
| Ingress | Externo, HTTPS, porta de destino 3000 |
| Recursos | 0,5 vCPU / 1 GiB |
| Escala | mín. 0 / máx. 1 (dorme sem tráfego; a cota grátis mensal cobre o uso) |
| Probes | Startup, Liveness e Readiness em `GET /api/saude` |
| Registry | `ghcr.io`, usuário `iansergio`, senha no secret `ghcrio-iansergio` (token com só `read:packages`, o mesmo do backend) |

Variáveis de ambiente:

| Variável | Valor | Por quê |
| --- | --- | --- |
| `API_URL` | `https://peca-api.thankfulglacier-8a723f55.canadacentral.azurecontainerapps.io/api` | URL da API, com `/api`, HTTPS e sem barra no final. Lida em runtime: trocar não exige nova imagem. |
| `NODE_ENV` | `production` | Cookies de sessão com `Secure`. A imagem já define. |
| `HOSTNAME` | `0.0.0.0` | O `server.js` escuta em todas as interfaces. A imagem já define. |
| `PORT` | `3000` | Igual à porta de destino do ingress. A imagem já define. |

Trocar a URL da API:

```bash
az containerapp update -g rg-peca-app -n peca-web \
  --set-env-vars API_URL="https://<host-do-backend>/api"
```

### Como foi criado (referência)

```bash
az containerapp create -g rg-peca-app -n peca-web --environment peca-env \
  --image <imagem-inicial> \
  --ingress external --target-port 3000 \
  --min-replicas 0 --max-replicas 1 --cpu 0.5 --memory 1Gi \
  --registry-server ghcr.io --registry-username iansergio --registry-password "<token read:packages>" \
  --env-vars API_URL=https://<host-do-backend>/api NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000

# Permissões mínimas da identidade do deploy
P=$(az identity show -g rg-peca-app -n oidc-msi-918b --query principalId -o tsv)
az role assignment create --assignee-object-id $P --assignee-principal-type ServicePrincipal \
  --role Contributor --scope $(az containerapp show -g rg-peca-app -n peca-web --query id -o tsv)
az role assignment create --assignee-object-id $P --assignee-principal-type ServicePrincipal \
  --role Reader --scope $(az containerapp env show -g rg-peca-app -n peca-env --query id -o tsv)
```

> **Pegadinha:** o Azure descarta a configuração do registry `ghcr.io` quando nenhuma imagem do app vem dele. Se o app for recriado com uma imagem pública de outro registry (ex.: `mcr.microsoft.com/...`), o registry some na hora. Crie o app já com uma imagem do `ghcr.io`, ou troque imagem e registry no mesmo `PATCH`.

## Backend, rede e CORS

- **CORS não é necessário.** O navegador só fala com o front, e quem chama a API é o servidor Node do container.
- **Firewall.** A API aceita tráfego público. O banco (Azure SQL) só precisa liberar o backend, não o front.
- **Limite por IP do OTP.** O front repassa o IP do visitante em `X-Forwarded-For`, usando a última entrada do header, que é a que o ingress do Container Apps acrescenta. O backend deve confiar nesse header só quando a requisição vier do front.
- **Cold start.** Front e backend escalam a zero.
  - A primeira visita depois de um tempo parado espera o front subir (alguns segundos).
  - A chamada à API pode ainda passar do timeout do front (8 s na vitrine, 10 s nas demais) enquanto o backend e o Azure SQL acordam. Nesse caso a página mostra o aviso amigável, e a próxima tentativa funciona.

## Conferir

```bash
az containerapp revision list -g rg-peca-app -n peca-web \
  --query "[].{rev:name, ativa:properties.active, saude:properties.healthState, img:properties.template.containers[0].image}" -o table
curl -s https://peca-web.thankfulglacier-8a723f55.canadacentral.azurecontainerapps.io/api/saude
```

## Rollback

1. **Reverter o commit (preferível):** `git revert <sha>` e push na `main`.
2. **Voltar para uma imagem anterior,** sem rebuild. Toda imagem fica no GHCR com o SHA do commit:

   ```bash
   az containerapp update -g rg-peca-app -n peca-web --image ghcr.io/iansergio/peca-front-end:<sha-bom>
   ```

3. **Reexecutar um deploy antigo que funcionou:** `gh run rerun <run-id>`. Continua ligado a `refs/heads/main`, então o OIDC funciona.

Depois de qualquer rollback, confira `/api/saude` e a home.

> Abas abertas durante um deploy podem mostrar erro na próxima ação de formulário ("Failed to find Server Action"), porque cada build gera novas chaves das Server Actions. Recarregar a página resolve.

## Logs

```bash
az containerapp logs show -g rg-peca-app -n peca-web --follow
```

O ambiente não tem Log Analytics, então os logs servem só para acompanhar ao vivo. Os `console.error` do front aparecem com prefixos como `[auth]`, `[perfil]` e `[criarAnuncio]`.

## Rodar a imagem localmente

```bash
docker build -t peca-front-end .
# No Linux, o --add-host faz host.docker.internal apontar para a máquina (backend local)
docker run --rm -p 3000:3000 --add-host=host.docker.internal:host-gateway \
  -e API_URL=http://host.docker.internal:8080/api peca-front-end
```
