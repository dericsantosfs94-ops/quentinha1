# Operação do painel administrativo

O painel da Cantina do Chalé permanece protegido por login e separado do fluxo público. O cliente pode consultar o cardápio, montar o pedido e abrir o WhatsApp sem criar conta.

## Produtos e categorias

Em **Itens do cardápio**, o administrador pode criar, editar, ativar, desativar e remover pratos, acompanhamentos, bebidas e sobremesas. Cada produto possui nome, categoria, descrição, preço, URL opcional, upload de foto, disponibilidade e o marcador **Cardápio do dia**.

O upload aceita PNG, JPEG e WebP de até 8 MB. A imagem é enviada ao storage persistente e a URL retornada é associada ao produto antes de salvar o formulário.

## Opções e complementos

Ao editar um produto existente, a seção **Opções e complementos** permite adicionar, editar, ativar/desativar e remover opções como proteína, tamanho, molho ou acompanhamento. Cada opção possui nome, descrição opcional, adicional de preço e disponibilidade.

No cardápio público, o cliente marca os complementos desejados. O preço exibido e o subtotal são recalculados com os adicionais, e os nomes das opções escolhidas seguem no resumo do pedido enviado ao WhatsApp.

## Cardápio do dia

O marcador **Cardápio do dia** destaca o produto em uma faixa própria na página pública. Remover o marcador não remove o produto do catálogo; apenas retira o destaque. Para ocultar o item completamente, use **Desativar**.

## Pagamento e WhatsApp

O site não processa pagamentos. No checkout, o cliente escolhe cartão de crédito na entrega/retirada, cartão de débito na entrega/retirada ou Pix via WhatsApp. No Pix, a página não exibe nem solicita a chave: o pedido é enviado com as especificações e a Cantina responde pelo WhatsApp com a chave e as instruções de pagamento.
## Pedidos já iniciados

O carrinho do cliente mantém uma cópia do item, do preço e das opções escolhidas no momento da adição. Alterar disponibilidade, categoria ou destaque no painel não apaga nem reescreve automaticamente um carrinho já iniciado; a mudança passa a valer para novas consultas do cardápio público. A confirmação final do pedido continua sendo feita pelo restaurante no WhatsApp.
