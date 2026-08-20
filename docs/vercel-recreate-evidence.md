# Evidência de recriação do projeto Vercel

A criação foi concluída no projeto Vercel `cantinadochale`, importando `dericsantosfs94-ops/quentinha1` na branch `main`.

URL temporária do deployment: https://cantinadochale-2c33vtyaz-gygg.vercel.app/

URL do fluxo de sucesso: https://vercel.com/new/gygg/success?auto-redirect=true&deploymentUrl=cantinadochale-2c33vtyaz-gygg.vercel.app&projectName=cantinadochale

A tela de sucesso informou `Congratulations! You just deployed a new project`. O preview carregou a interface Cantina do Chalé e ficou em `Preparando o cardápio...` durante a captura, indicando que a função pública ainda precisa ser validada no domínio final.

Variáveis adicionadas no primeiro deploy: `SUPABASE_URL`, `VITE_SUPABASE_URL`, `SUPABASE_ANON_KEY`, `VITE_SUPABASE_ANON_KEY` e `SUPABASE_ADMIN_EMAIL`, em Production e Preview. A `SUPABASE_SERVICE_ROLE_KEY` ainda não foi adicionada porque a UI de importação `.env` não expôs o seletor de arquivo; operações administrativas server-side exigirão essa variável ou políticas RLS equivalentes.

## Diagnóstico do primeiro deployment

O deployment inicial `559e3af` e o deployment `fe60a41` retornaram `FUNCTION_INVOCATION_FAILED` no endpoint `GET /api/trpc/menu.public`. Os logs da Vercel registraram `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/server/app'` e, após a primeira tentativa de extensão, `Cannot find module '/var/task/server/app.ts'`.

A correção foi publicada no commit `37f46dc`: o build agora gera `api/trpc/app.mjs` com esbuild antes do build Vite, e `api/trpc/[trpc].ts` importa `./app.mjs`. O deployment correspondente foi criado com o URL temporário https://cantinadochale-6kr4sg0b1-gygg.vercel.app/ e estava em `Building` no momento desta atualização.

A proteção `Vercel Authentication` foi desativada no projeto para que o storefront e `/api/trpc` possam ser públicos. O domínio fixo continua sendo https://cantinadochale.vercel.app/.
