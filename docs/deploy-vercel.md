# Deploy na Vercel — Cantina do Chalé

## Estado atual

O projeto usa frontend React/Vite, backend Express/tRPC em função serverless, Supabase Auth para o admin, Supabase Postgres para o catálogo e Supabase Storage para as imagens do bucket público `menu-products`. O catálogo restaurado foi migrado sem exclusões: quatro categorias, nove produtos e oito fotos.

A configuração Vercel usa `dist/public` para o frontend e `/api/trpc/[trpc].ts` como função Node serverless. O servidor Express de preview continua disponível para desenvolvimento local e hospedagens Node tradicionais.

## Variáveis na Vercel

Cadastre as variáveis em Production e Preview. `Development` é opcional para uso com a Vercel CLI. Nunca envie valores reais ao GitHub.

| Variável | Obrigatória | Uso |
|---|---:|---|
| `SUPABASE_URL` | Sim | URL do projeto Supabase no backend |
| `SUPABASE_ANON_KEY` | Sim | Chave pública para autenticação server-side e fallback de leitura |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim, somente server-side | Operações administrativas e upload no Storage; nunca usar em `VITE_` |
| `SUPABASE_ADMIN_EMAIL` | Sim | E-mail autorizado do admin: `admimsupabase@proton.me` |
| `VITE_SUPABASE_URL` | Sim | URL Supabase exposta ao frontend Vite |
| `VITE_SUPABASE_ANON_KEY` | Sim | Publishable/anon key exposta ao frontend |
| `JWT_SECRET` | Recomendada | Compatibilidade com módulos de sessão legados |

A senha do administrador não deve ser colocada na Vercel nem no código. Ela permanece no Supabase Auth.

## Build settings

| Configuração | Valor |
|---|---|
| Framework | Other ou Vite |
| Build command | `pnpm build:vercel` |
| Output directory | `dist/public` |
| Install command | `pnpm install` |
| Node.js | 22.x ou compatível |

O arquivo `vercel.json` já declara o build, o output, a função tRPC e o fallback do SPA.

## Checklist de validação

A sequência correta é concluir a implementação e testes locais, criar o commit, confirmar o catálogo no Supabase, publicar a Vercel e então testar o domínio. Verifique `/`, `/api/trpc/menu.public` e `/admin`; confirme que o cardápio retorna produtos, que as imagens `storage/v1/object/public/menu-products/...` carregam, que o admin aceita o e-mail autorizado e que o checkout bloqueia quando `is_open=false`.

O catálogo não deve ser apagado ou recriado durante novos deploys. Migrações futuras devem usar upsert idempotente e manter uma exportação verificável antes de qualquer alteração.
