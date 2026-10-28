# Deploy no Azure App Service

O front roda no App Service **`peca-front-end`** (Linux, Node 24). O build gera `.next/standalone` (`output: "standalone"` no `next.config.ts`): um `server.js` mínimo com só os `node_modules` usados. O App Service roda `node server.js`, sem `npm install` nem build no servidor.

## Como o deploy acontece

Em todo PR para a `main`, o workflow [`.github/workflows/verificacao.yml`](../.github/workflows/verificacao.yml) roda `npm ci`, `npm run lint` e `npm run build` (o build também checa os tipos), sem deploy.

A cada push na `main` (ou manualmente, em **Actions → Run workflow**), o workflow [`.github/workflows/main_peca-front-end.yml`](../.github/workflows/main_peca-front-end.yml) faz o deploy, um por vez (`concurrency`):

1. `npm ci` e `npm run build` no runner (Node 24).
2. Copia `.next/static` para `.next/standalone/.next/static` e `public` para `.next/standalone/public` (se a pasta existir).
3. Zipa **só o conteúdo** de `.next/standalone`, incluindo a pasta oculta `.next` e sem arquivos `.env*`.
4. Faz login no Azure por OIDC (segredos `AZUREAPPSERVICE_*` do repositório) e publica o zip com `azure/webapps-deploy`.

> **OIDC e `environment`:** a credencial federada atual aceita tokens com subject `repo:iansergio/peca-front-end:ref:refs/heads/main`. Por isso:
> - o deploy só funciona disparado a partir da `main`;
> - o job **não** usa `environment:`. Com ele, o subject passaria a ser `...:environment:Production`.
>
> Para usar um environment (com aprovação manual, por exemplo), crie antes uma credencial federada com esse subject na identidade do Azure e só depois adicione `environment: Production` ao job `deploy`.

## Configuração do App Service (uma vez)

Rode os comandos com uma conta que tenha acesso ao app. Confira a assinatura antes: o App Service do front pode não estar na mesma assinatura do backend.

```bash
az account list --query "[].{nome:name, id:id}" -o table
az account set --subscription "<assinatura-do-front>"

APP=peca-front-end
RG=$(az webapp list --query "[?name=='$APP'].resourceGroup | [0]" -o tsv)
echo "$RG"   # precisa imprimir o resource group; vazio = assinatura errada
```

### Runtime e comando de inicialização

O runtime precisa ser o mesmo Node do build (24). Veja os disponíveis com `az webapp list-runtimes --os linux`.

```bash
az webapp config set -g "$RG" -n "$APP" \
  --linux-fx-version "NODE|24-lts" \
  --startup-file "node server.js"
```

### Variáveis (App Settings)

```bash
az webapp config appsettings set -g "$RG" -n "$APP" --settings \
  API_URL="https://<host-do-backend>/api" \
  NODE_ENV=production \
  HOSTNAME=0.0.0.0 \
  PORT=8080 \
  WEBSITES_PORT=8080 \
  SCM_DO_BUILD_DURING_DEPLOYMENT=false
```

| Variável | Por quê |
| --- | --- |
| `API_URL` | URL da API com `/api`, **HTTPS** e sem barra no final. Lida só no servidor, em tempo de execução: trocar não exige novo build, só reiniciar o app. |
| `NODE_ENV=production` | Cookies de sessão com `Secure` e o Next em modo de produção. |
| `HOSTNAME=0.0.0.0` | O `server.js` precisa escutar em todas as interfaces, não só em `localhost`, para o proxy do App Service alcançar. |
| `PORT=8080` / `WEBSITES_PORT=8080` | Porta em que o `server.js` escuta e para onde o App Service encaminha. |
| `SCM_DO_BUILD_DURING_DEPLOYMENT=false` | O pacote já vem pronto. Sem isso, o Oryx tentaria rodar `npm install` e build no servidor. |

### HTTPS, Always On e health check

```bash
az webapp update -g "$RG" -n "$APP" --https-only true

# Always On evita o "sono" do app após inatividade. Não existe no plano Free (F1).
az webapp config set -g "$RG" -n "$APP" --always-on true

# Health check: o App Service chama /api/saude e tira de rotação a instância que falhar.
az webapp config set -g "$RG" -n "$APP" \
  --generic-configurations '{"healthCheckPath": "/api/saude"}'
```

A rota `/api/saude` devolve `{"status":"ok"}` e **não** chama o backend: uma queda da API não derruba o front. A vitrine continua de pé e mostra o aviso amigável.

### Conferir

```bash
az webapp config show -g "$RG" -n "$APP" \
  --query "{runtime:linuxFxVersion, startup:appCommandLine, alwaysOn:alwaysOn, health:healthCheckPath}"
az webapp config appsettings list -g "$RG" -n "$APP" --query "[].name" -o tsv
curl -s "https://$(az webapp show -g "$RG" -n "$APP" --query defaultHostName -o tsv)/api/saude"
```

## Backend, rede e CORS

- **CORS não é necessário.** O navegador só fala com o front; quem chama a API é o servidor Node do App Service.
- **Backend.** A API roda em outro App Service (`peca-backend`, Java SE) e aceita tráfego público. O `API_URL` aponta para `https://<app-do-backend>.azurewebsites.net/api`.
- **Firewall do backend.** Se um dia o backend restringir o acesso por IP (Access restrictions), libere os IPs de saída deste App Service:

  ```bash
  az webapp show -g "$RG" -n "$APP" --query possibleOutboundIpAddresses -o tsv
  ```

  Use `possibleOutboundIpAddresses`, e não só `outboundIpAddresses`: a lista completa cobre uma troca de plano ou de escala. O front não fala com o banco (PostgreSQL do Supabase): só o backend se conecta a ele.
- **Limite por IP do OTP.** O front-end do App Service não sobrescreve o `X-Forwarded-For`: ele acrescenta no fim o endereço de quem conectou, às vezes com porta (`203.0.113.7:51234`). O `lib/visitante.ts` pega essa última entrada, tira a porta e a repassa ao backend em `X-Forwarded-For`. No backend, o App Service acrescenta o IP do front no fim e o Spring usa a primeira entrada, que é a do visitante.
- **Cold start.** Sem Always On (ou no plano Free), o App Service do backend dorme depois de um tempo sem uso, e a JVM leva alguns segundos para subir. A primeira requisição pode passar do timeout do front (8 s na vitrine, 10 s nas demais). Nesse caso a página mostra o aviso amigável, e a próxima tentativa funciona. Always On no backend evita isso.

## Rollback

1. **Reverter o commit (preferível):** `git revert <sha>` e push na `main`. O workflow publica a versão anterior.
2. **Reexecutar um deploy antigo que funcionou:** em **Actions**, abra a execução boa e use **Re-run all jobs**, ou rode `gh run rerun <run-id>`. A execução refaz o build do commit daquela vez. Como ela continua ligada a `refs/heads/main`, o login OIDC funciona.
3. **Publicar um zip já gerado** (artefatos ficam 7 dias):

   ```bash
   gh run download <run-id> -n node-app      # baixa release.zip
   az webapp deploy -g "$RG" -n "$APP" --src-path release.zip --type zip
   ```

Depois de qualquer rollback, confira `/api/saude` e a home.

> Abas abertas durante um deploy podem mostrar erro na próxima ação de formulário ("Failed to find Server Action"), porque cada build gera novas chaves das Server Actions. Recarregar a página resolve.

## Logs

```bash
az webapp log config -g "$RG" -n "$APP" --docker-container-logging filesystem
az webapp log tail -g "$RG" -n "$APP"
```

Os `console.error` do front aparecem com prefixos como `[auth]`, `[perfil]` e `[criarAnuncio]`.
