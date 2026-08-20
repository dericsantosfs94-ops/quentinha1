# Deploy na Vercel — Cantina do Chalé

## Estado atual

O projeto está estruturado como frontend React/Vite com backend Express/tRPC e banco MySQL/TiDB via Drizzle. O login administrativo usa Supabase Auth por e-mail e senha, mas o catálogo restaurado ainda utiliza o banco legado e o helper de storage legado. Portanto, esta configuração permite publicar a aplicação na Vercel, mas **não representa ainda uma migração 100% para Supabase Database e Supabase Storage**.

A configuração Vercel adicionada neste estado usa `dist/public` para o frontend e `/api/trpc/[trpc].ts` como função Node serverless. O servidor Express de preview continua existindo para desenvolvimento local e hospedagens Node tradicionais.

## Variáveis na Vercel

Cadastre as variáveis abaixo nos ambientes Production, Preview e Development conforme necessário. Nunca envie valores reais para o GitHub.

| Variável | Obrigatória | Uso |
|---|---:|---|
| `DATABASE_URL` | Sim neste estado | Conexão MySQL/TiDB usada pelo Drizzle para categorias, produtos e status |
| `SUPABASE_URL` | Sim | Verificação server-side do token Supabase Auth |
| `SUPABASE_ANON_KEY` | Sim | Chave pública usada pelo cliente server-side atual |
| `SUPABASE_ADMIN_EMAIL` | Sim | E-mail autorizado do admin, atualmente `admimsupabase@proton.me` |
| `VITE_SUPABASE_URL` | Sim | URL Supabase exposta ao frontend Vite |
| `VITE_SUPABASE_ANON_KEY` | Sim | Chave publishable/anon exposta ao frontend |
| `BUILT_IN_FORGE_API_URL` | Necessária se o storage legado for usado | Proxy de storage e módulos legados do runtime |
| `BUILT_IN_FORGE_API_KEY` | Necessária se o storage legado for usado | Credencial server-side do proxy legado |
| `JWT_SECRET` | Recomendada | Segredo usado por módulos de sessão legados; não deve ser compartilhado |

A senha do administrador **não deve ser colocada na Vercel nem no código**. Ela permanece no Supabase Auth. O usuário administrador é `admimsupabase@proton.me`.

## Build settings

A Vercel deve usar:

| Configuração | Valor |
|---|---|
| Framework | Other ou Vite, conforme o painel detectar |
| Build command | `pnpm build:vercel` |
| Output directory | `dist/public` |
| Install command | `pnpm install` |
| Node.js | 22.x ou compatível com as dependências |

O arquivo `vercel.json` já declara o build, o output, a função tRPC e o fallback do SPA.

## Limitações e decisão de hospedagem

A Vercel é a opção mais adequada para o frontend Vite e a função serverless tRPC. Hostinger Business/Cloud também pode executar Node.js e Express, mas exige configurar o entry file e o processo Node no painel. HostGator compartilhado não deve ser escolhido para este backend sem confirmar suporte Node no plano; VPS/Dedicated oferece mais controle.

Para uma arquitetura realmente 100% Supabase, ainda será necessário migrar `server/db.ts` de Drizzle/MySQL para Supabase Postgres, trocar o upload legado pelo bucket Supabase Storage e remover as variáveis `DATABASE_URL`, `BUILT_IN_FORGE_API_URL` e `BUILT_IN_FORGE_API_KEY`. Essa etapa deve ser feita em uma branch/ambiente separado para não repetir a perda do catálogo restaurado.

## Checklist antes do Deploy

1. Conectar a Vercel ao repositório `dericsantosfs94-ops/quentinha1`, branch `main`.
2. Cadastrar as variáveis de ambiente acima sem incluir a senha do admin.
3. Executar o primeiro deploy e testar `/`, `/api/trpc/menu.public` e `/admin`.
4. Entrar no painel com `admimsupabase@proton.me` e testar uma operação sem apagar dados.
5. Confirmar no Supabase Auth que o e-mail está confirmado e no banco legado que a conta possui permissão administrativa.
