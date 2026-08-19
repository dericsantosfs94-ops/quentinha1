# Migração Supabase + Vercel da Cantina do Chalé

## Estado da implementação

O projeto foi reestruturado para usar **Supabase como banco, autenticação e storage**, mantendo tRPC como camada de contrato durante a transição. O frontend continua em React/Vite, enquanto o endpoint `api/trpc/[trpc].ts` expõe a API como função compatível com o modelo Serverless da Vercel.

| Área | Implementação atual |
|---|---|
| Banco | `@supabase/supabase-js` em `server/db.ts` |
| Autenticação | Supabase Auth com e-mail/senha em `auth.login` |
| Sessão | Cookie HTTP-only com access token, refresh token e expiração |
| Renovação | `createContext` renova a sessão próxima do vencimento |
| Logout | Chama `supabase.auth.signOut()` e limpa o cookie |
| Storage | Bucket `menu-products`, com URL pública retornada após upload |
| Admin | `/admin`, `ctx.user.role === 'admin'` e `adminProcedure` |
| Loja fechada | Bloqueia “Continuar pedido” e envio ao WhatsApp |
| Vercel | `vercel.json`, `vercel-build` e `api/trpc/[trpc].ts` |
| Banco legado | Drizzle/MySQL removidos das dependências de runtime |

## Variáveis de ambiente

Configure estas variáveis no projeto Vercel, tanto em Preview quanto em Production:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-publica-anon-ou-publishable
```

A chave `service_role` não é necessária nesta implementação e não deve ser exposta ao frontend. O teste `server/supabase.config.test.ts` valida a URL e consulta o endpoint público de configuração do Auth.

## Supabase Auth e usuários admin

Crie o usuário administrativo em **Authentication → Users** no painel do Supabase. Depois, crie ou mantenha o registro correspondente em `public.users`, usando o UUID do usuário Auth no campo `open_id` e `role = 'admin'`.

Exemplo:

```sql
insert into public.users (open_id, name, email, login_method, role)
values ('UUID_DO_AUTH_USER', 'Administrador', 'admin@exemplo.com', 'email', 'admin')
on conflict (open_id) do update set role = 'admin', email = excluded.email;
```

O login do painel chama `signInWithPassword` no backend. A sessão é gravada em cookie HTTP-only com access token, refresh token e `expires_at`. Em requisições posteriores, o contexto tRPC renova a sessão quando ela estiver próxima do vencimento. O logout chama `signOut()` no Supabase e remove o cookie local.

## RLS e Storage

Execute o arquivo `docs/supabase-rls.sql` no SQL Editor do Supabase. Ele habilita RLS nas tabelas do cardápio, permite leitura pública apenas de categorias ativas e produtos/opções disponíveis, e reserva mutações para perfis cuja linha em `public.users` tenha `role = 'admin'`.

O mesmo arquivo cria ou atualiza o bucket público `menu-products` e suas políticas. O endpoint `menu.products.uploadImage` recebe o arquivo como data URL, valida o tipo e o limite de 8 MB, envia os bytes ao bucket e salva a URL pública no produto.

## Execução Serverless

A aplicação original tinha um processo Express persistente com `server.listen()`. Para Vercel, foi adicionada a fábrica `server/app.ts`, que monta apenas o app de API, e o handler `api/trpc/[trpc].ts`, que pode ser compilado como função Serverless. O `server/_core/index.ts` permanece somente como entrypoint de desenvolvimento/preview local; ele não é necessário para o deploy da Vercel.

O build da Vercel é:

```bash
pnpm vercel-build
```

Ele executa `vite build` e publica `dist/public`. O build local completo continua disponível em `pnpm build` para manter compatibilidade com o preview atual.

A validação realizada neste ambiente confirmou `pnpm check`, 17 testes Vitest e os builds `pnpm vercel-build` e `pnpm build`. Ainda não foi feito um deploy real na conta Vercel, portanto o último passo operacional é conectar o repositório, configurar as duas variáveis e testar `/api/trpc/menu.public` no domínio Vercel.

## Checkout com loja fechada

A Home lê `restaurant_settings.is_open`. Quando o valor é `false`, o carrinho mostra um aviso, o botão de avanço fica desabilitado e `sendOrder()` retorna antes de gerar a URL do WhatsApp. A validação ocorre tanto no botão quanto na função de envio para evitar bypass por estado antigo da interface.

## Assets

As referências a `/manus-storage/...` foram removidas do frontend. A Home e o Admin usam um `BrandMark` local, e o favicon/Open Graph usam `client/public/favicon.svg`, que não dependem do proxy Manus. As fotos de produtos, por sua vez, devem ser cadastradas pelo upload Supabase Storage.

## Arquivos principais

| Arquivo | Função |
|---|---|
| `server/supabase.ts` | Cliente Supabase e mapeamento de usuário |
| `server/db.ts` | Consultas e mutações Supabase |
| `server/_core/context.ts` | Sessão, refresh token e usuário atual |
| `server/routers.ts` | Auth, catálogo, CRUD e upload |
| `server/app.ts` | Fábrica de API reutilizável pela Vercel |
| `api/trpc/[trpc].ts` | Função Serverless do tRPC |
| `docs/supabase-rls.sql` | Políticas de banco e Storage |
