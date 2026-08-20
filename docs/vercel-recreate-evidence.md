# Evidência de recriação do projeto Vercel

A criação foi concluída no projeto Vercel `cantinadochale`, importando `dericsantosfs94-ops/quentinha1` na branch `main`.

URL temporária do deployment: https://cantinadochale-2c33vtyaz-gygg.vercel.app/

URL do fluxo de sucesso: https://vercel.com/new/gygg/success?auto-redirect=true&deploymentUrl=cantinadochale-2c33vtyaz-gygg.vercel.app&projectName=cantinadochale

A tela de sucesso informou `Congratulations! You just deployed a new project`. O preview carregou a interface Cantina do Chalé e ficou em `Preparando o cardápio...` durante a captura, indicando que a função pública ainda precisa ser validada no domínio final.

Variáveis adicionadas no primeiro deploy: `SUPABASE_URL`, `VITE_SUPABASE_URL`, `SUPABASE_ANON_KEY`, `VITE_SUPABASE_ANON_KEY` e `SUPABASE_ADMIN_EMAIL`, em Production e Preview. A `SUPABASE_SERVICE_ROLE_KEY` ainda não foi adicionada porque a UI de importação `.env` não expôs o seletor de arquivo; operações administrativas server-side exigirão essa variável ou políticas RLS equivalentes.
