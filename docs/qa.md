# QA do storefront

A home foi revisada em viewport mobile de 390×844 e desktop de 1280×720. No mobile, o hero mantém o nome, slogan, localização, CTA e status legíveis; categorias rolam horizontalmente e o carrinho usa barra fixa inferior quando há itens. No desktop, o hero usa composição assimétrica em duas colunas e o cardápio preserva hierarquia e espaçamento.

A home pública, o cardápio, o carrinho e o checkout são acessíveis sem sessão. O checkout exibe entrega ou retirada, pagamento na entrega/retirada ou Pix pelo WhatsApp, e o resumo inclui a escolha antes de abrir o link oficial do WhatsApp.

A interface usa `focus-visible`, alvos de toque com altura mínima de aproximadamente 44 px, `aria-label` nos controles iconográficos, `aria-live="polite"` no contador do carrinho, `loading="lazy"` para imagens de produtos e `prefers-reduced-motion` para reduzir transições. O estado vazio do cardápio informa que as fotos e preços aguardam confirmação, sem inventar conteúdo. A home e o painel exibem estados explícitos de carregamento; ambos exibem uma mensagem de erro e ação de tentativa novamente quando a consulta de cardápio falha.

O contraste foi revisado por tokens: texto escuro sobre papel claro, texto claro sobre bordô e CTA laranja com texto escuro. O build e os testes foram executados com sucesso: TypeScript sem erros, 4 arquivos Vitest e 7 testes aprovados, além do build de produção concluído. O alerta restante do build é apenas sobre tamanho de chunk, sem falha funcional.

Durante a validação no preview, a home pública abriu sem sessão e exibiu os oito cards com fotos reais e preço de R$ 25,00. O contrato do fluxo de checkout foi validado por TypeScript, testes e build: carrinho, subtotal, entrega/retirada, pagamento Pix ou na entrega/retirada e geração do link codificado do WhatsApp. A validação runtime publicada foi feita fora do overlay do modo preview e não dependeu de login. O teste não envia mensagem nem conclui uma conversa; apenas intercepta a URL que o site abriria.

Na segunda validação da home, a âncora `#cardapio` abriu a seção pública sem login; a navegação exibiu as categorias e os oito produtos com botões `Adicionar`. O preview confirmou visualmente as imagens e valores provisórios em R$ 25,00 nos cards. A validação runtime final do carrinho e checkout deve ser feita fora do overlay do modo preview, preferencialmente no domínio publicado.

Diagnóstico do relato de botões sem interação: os logs de sessão registraram cliques reais em `Adicionar` e eventos `add_to_cart` para os itens 1, 2 e 3, além de eventos `view_item_list` ao alternar categorias. Isso confirma que os handlers da Home estão ativos. A captura do ambiente usado para revisão exibe caixas pontilhadas numeradas e a faixa `Preview mode`, indicando um overlay/editor sobre a página; esse modo pode interceptar ou mascarar a interação visual. A validação do cliente deve ser feita abrindo o domínio publicado em uma aba normal, sem o painel/overlay de Preview mode.

No domínio publicado `cantinashop-8wstdovz.manus.space`, a seção do cardápio renderizou as categorias e os botões `Adicionar` com as oito imagens. A captura desta revisão ainda mostra o overlay de inspeção com caixas numeradas sobre a página, portanto a confirmação de clique precisa ser feita em uma aba normal do domínio, sem a camada de revisão.

## Atualização do catálogo

Após implementar opções, upload de fotos e destaque do Cardápio do dia, a checagem TypeScript, o build de produção e a suíte Vitest foram executados com sucesso. A suíte atual possui 11 testes aprovados, incluindo seleção de produtos destacados, cálculo de adicionais, leitura do contrato administrativo e bloqueio de usuário comum. A validação visual do painel ainda requer sessão de administrador real; o fluxo público não exige login.

A suíte Vitest também cobre o carrinho em andamento: um item adicionado a R$ 25,00 permanece com esse preço e quantidade mesmo quando uma representação posterior do catálogo é alterada para R$ 40,00 e indisponível. Isso documenta o comportamento de snapshot local esperado para pedidos já iniciados.

## Validação runtime publicada — 20/08/2026

O Playwright foi executado contra `https://cantinadochale.vercel.app/`, fora do preview. Sem login, o fluxo exercitou os handlers de adicionar produto, abrir carrinho, aumentar quantidade, abrir checkout e selecionar `Pix via WhatsApp`. O primeiro produto real (`Risoto de camarão`) carregou sua imagem do Supabase e o subtotal foi atualizado para R$ 50,00. Como a loja estava aberta no momento da execução, o envio foi acionado com `window.open` interceptado no navegador: a URL capturada começou por `https://api.whatsapp.com/send`, sem abrir conversa externa real. O resumo capturado continha o pagamento Pix negociado pelo WhatsApp, nome, endereço, produto e subtotal. Evidência detalhada: `docs/runtime-vercel-evidence.md`.

A validação adicional exercitou os cinco filtros públicos sem login. `Tudo` exibiu 8 cards, `Pratos caseiros` exibiu 8, e `Acompanhamentos`, `Bebidas` e `Sobremesas` exibiram estado vazio com 0 cards; cada botão assumiu o estado ativo corretamente. No admin publicado, foram exercitados o status reversível, a seleção das quatro categorias, o editor de categoria e o editor do primeiro produto, sem salvar ou excluir dados.
