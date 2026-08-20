# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A clientela da Cantina do Chalé acessa o cardápio público pelo celular ou desktop, sem login, para consultar pratos, montar um carrinho e enviar o pedido pelo WhatsApp. A equipe da cantina usa uma área administrativa protegida por Supabase Auth para operar o status da loja e manter categorias, produtos, imagens, disponibilidade, destaque do dia e opções.

## Product Purpose

O produto é um cardápio digital público para comida caseira em Santo Aleixo, Magé, com carrinho e checkout orientado ao WhatsApp. O sucesso operacional é permitir que o cliente monte o pedido sem criar conta e que a equipe atualize o cardápio sem depender de código.

## Positioning

A experiência combina descoberta de comida caseira, retirada na loja e entrega negociada pelo WhatsApp com operação administrativa direta para uma pequena cantina. O site não processa pagamentos internamente; registra a modalidade escolhida no resumo e encaminha as especificações para a conversa do WhatsApp.

## Operating Context

A operação pública acontece no domínio `https://cantinadochale.vercel.app/`. A equipe acessa `/admin` com uma sessão Supabase Auth e pode alternar a loja entre aberta e fechada, selecionar categorias, editar registros, gerenciar fotos e opções e controlar disponibilidade. O catálogo real contém quatro categorias e oito produtos com fotos públicas no Supabase Storage; categorias sem itens exibem estado vazio.

## Capabilities and Constraints

O storefront oferece filtros por categoria, imagens, preços, carrinho, quantidade, subtotal, checkout com entrega ou retirada, cartão ou Pix negociado no WhatsApp e bloqueio de envio quando a loja está fechada. O admin oferece CRUD protegido de categorias, produtos e opções, upload/remoção de fotos, disponibilidade, destaque do dia e status da loja. A arquitetura usa React, Vite, Tailwind, tRPC, funções serverless Vercel e Supabase para Auth, Storage e dados integrados ao catálogo existente. Não há login público, pagamento in-app, chave Pix exibida na página ou avaliações/testemunhos fabricados.

## Brand Commitments

O nome é Cantina do Chalé. A voz é calorosa e informal, com o slogan “Aquecendo corações desde 2013”. A identidade deve preservar a logo oficial, a capa oficial, o bordô dominante, o âmbar/dourado para ação e destaque, o magenta como apoio e a direção artesanal “Receita de Família”. O endereço publicado é Rua Malvino Ferreira de Andrade, 689 — Santo Aleixo, Magé — RJ.

## Evidence on Hand

As evidências reais incluem oito fotos de produtos compartilhadas no projeto, os arquivos de documentação visual `DESIGN.md`, `docs/qa.md`, `docs/runtime-vercel-evidence.md` e `docs/impeccable-audit-2026-08-20.md`, além dos testes Vitest e Playwright. A validação publicada confirmou catálogo, imagens, carrinho, subtotal, checkout sem login, Pix selecionado, URL do WhatsApp interceptada, filtros públicos, editor de categoria, editor de produto e toggle reversível de status. Dados oficiais faltantes de nome/descrição para itens provisórios continuam abertos e não devem ser inventados.

## Product Principles

1. O cliente deve conseguir pedir sem login e com o mínimo de fricção.
2. A equipe deve conseguir operar o cardápio com segurança e feedback claro.
3. O WhatsApp é o canal de negociação e confirmação do pedido, não um detalhe escondido.
4. A identidade artesanal deve apoiar clareza operacional, não competir com ela.
5. Dados não confirmados devem permanecer explicitamente provisórios até validação do restaurante.

## Accessibility & Inclusion

A interface deve ser responsiva, navegável por teclado, compatível com leitores de tela nos diálogos e respeitar `prefers-reduced-motion`. Deve manter contraste legível, áreas de toque adequadas, estados vazios e mensagens de erro compreensíveis em telas estreitas e orientação paisagem.
