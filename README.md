# Cantina do Chalé — Pedidos Online

O projeto implementa um cardápio digital mobile-first para a **Cantina do Chalé**, restaurante de comida caseira em Santo Aleixo/Magé-RJ. A experiência pública prioriza descoberta rápida do cardápio, carrinho simples e finalização **exclusivamente por WhatsApp**, conforme requisito do negócio.

## Escopo atual

A aplicação possui uma home acolhedora com status do restaurante, navegação por categorias, cards de produtos, carrinho persistido durante a sessão, formulário de entrega ou retirada e geração de mensagem formatada para o WhatsApp da Cantina. O painel administrativo é protegido pelo login do projeto e usa autorização de administrador para gerenciar categorias, produtos, disponibilidade e status do restaurante.

## Decisões técnicas

| Área | Decisão |
|---|---|
| Frontend | React + Vite + Tailwind CSS 4, aproveitando o scaffold WebDev existente |
| Backend | Express + tRPC para contratos tipados entre UI e servidor |
| Persistência | MySQL/TiDB via Drizzle; imagens devem ser mantidas em storage externo do projeto |
| Checkout | Link `api.whatsapp.com/send` com telefone `5521988678298` e resumo URL-encoded |
| Autenticação | Manus OAuth já integrado ao projeto; operações administrativas usam `adminProcedure` |
| Comércio | Não usar checkout Shopify nesta versão: o requisito do restaurante determina WhatsApp como canal exclusivo |
| Conteúdo | Produtos sem preço confirmado ficam pendentes; não são inventados preços, avaliações ou depoimentos |

## Estrutura

```text
/design                 Tokens e decisões de interface
/storefront             Documentação da experiência pública
/content/cardapio       Catálogo estruturado e observações de revisão
/content/midia          Referência para fotos recebidas
/docs                   Fluxo de pedido e decisões de negócio
/analytics              Plano de eventos
/client                 Aplicação React
/server                 API tRPC e persistência
/drizzle                Schema e migrações do banco
```

## Execução local

Use `pnpm install` e depois `pnpm dev`. Para validar o código, execute `pnpm check`, `pnpm test` e `pnpm build`. O ambiente WebDev injeta as variáveis de autenticação, banco, storage e analytics; não crie arquivos `.env` com segredos no repositório.

## Administração

Acesse `/admin` após autenticar com uma conta autorizada. O dono do projeto é promovido automaticamente a administrador pelo fluxo de autenticação existente. O painel permite criar, editar, ativar e desativar categorias e itens e alternar o status aberto/fechado.

## Imagens e preços

As fotos do cardápio devem ser carregadas para o storage do projeto e referenciadas por URL persistente. O arquivo `content/cardapio/menu.json` centraliza nome, descrição, categoria, preço e observações; valores não informados ficam explicitamente como pendentes até revisão humana.

## Publicação

Depois de revisar o cardápio real, testar o fluxo de WhatsApp em celular e confirmar os dados de entrega, salve um checkpoint e use o botão Publish da interface de gerenciamento do projeto.
