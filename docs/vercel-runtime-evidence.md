# Evidência do deployment Vercel

Em 20 de agosto de 2026, o projeto `cantinadochale` recebeu o commit `790c0ee` no GitHub e a Vercel publicou um deployment Ready a partir da branch `main`. O erro anterior de build, `Function Runtimes must have a valid version`, foi corrigido removendo `runtime: nodejs22.x` do `vercel.json`.

A URL `https://cantinadochale.vercel.app/` agora renderiza a interface visual da Cantina do Chalé, com título, slogan, endereço `Rua Malvino Ferreira de Andrade, 689 — Santo Aleixo, Magé — RJ`, área administrativa e cobertura de entrega. O comportamento confirma que o problema de exibição de código-fonte foi resolvido.

O cardápio público aparece vazio na Vercel porque o ambiente externo ainda não possui `DATABASE_URL`. O código restaurado consulta o catálogo no MySQL/TiDB legado e retorna estado vazio quando essa variável não existe. O Supabase Auth está configurado separadamente, mas não substitui o banco do catálogo nesta versão.
