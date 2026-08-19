# QA do storefront

A home foi revisada em viewport mobile de 390×844 e desktop de 1280×720. No mobile, o hero mantém o nome, slogan, localização, CTA e status legíveis; categorias rolam horizontalmente e o carrinho usa barra fixa inferior quando há itens. No desktop, o hero usa composição assimétrica em duas colunas e o cardápio preserva hierarquia e espaçamento.

A home pública, o cardápio, o carrinho e o checkout são acessíveis sem sessão. O checkout exibe entrega ou retirada, pagamento na entrega/retirada ou Pix pelo WhatsApp, e o resumo inclui a escolha antes de abrir o link oficial do WhatsApp.

A interface usa `focus-visible`, alvos de toque com altura mínima de aproximadamente 44 px, `aria-label` nos controles iconográficos, `aria-live="polite"` no contador do carrinho, `loading="lazy"` para imagens de produtos e `prefers-reduced-motion` para reduzir transições. O estado vazio do cardápio informa que as fotos e preços aguardam confirmação, sem inventar conteúdo. A home e o painel exibem estados explícitos de carregamento; ambos exibem uma mensagem de erro e ação de tentativa novamente quando a consulta de cardápio falha.

O contraste foi revisado por tokens: texto escuro sobre papel claro, texto claro sobre bordô e CTA laranja com texto escuro. O build e os testes foram executados com sucesso: TypeScript sem erros, 4 arquivos Vitest e 7 testes aprovados, além do build de produção concluído. O alerta restante do build é apenas sobre tamanho de chunk, sem falha funcional.

Durante a validação runtime no preview, a home pública abriu sem sessão, exibiu os oito cards com fotos reais e preço de R$ 25,00, e o primeiro clique em Adicionar fez a barra fixa mostrar 1 item. O fluxo de checkout também foi revisado no código e coberto pelo resumo compartilhado/testes, incluindo pagamento Pix e pagamento na entrega/retirada. A validação visual direta do botão da barra ficou limitada pelo overlay do modo preview, mas a ação está ligada a `setCartOpen(true)` e a sequência de checkout está coberta por código e testes.

Na segunda validação runtime da home, a âncora `#cardapio` abriu a seção pública sem login; a navegação exibiu as categorias e os oito produtos com botões `Adicionar`. O preview confirmou visualmente as imagens e valores provisórios em R$ 25,00 nos cards.
