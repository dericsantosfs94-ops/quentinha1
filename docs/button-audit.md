# Auditoria de botões e ações

| Área | Controle | Ação implementada |
|---|---|---|
| Home | Ver cardápio | Navega para a seção `#cardapio` |
| Home | Santo Aleixo/Magé-RJ | Navega para a seção de localização |
| Home | Falar no WhatsApp | Abre o link oficial do WhatsApp da Cantina |
| Home | Tudo e categorias | Filtra o catálogo por categoria |
| Home | Adicionar | Adiciona o produto ao carrinho e atualiza quantidade/subtotal |
| Home | Carrinho/Ver pedido | Abre o drawer do carrinho |
| Carrinho | Mais/Menos | Altera a quantidade; remove ao chegar a zero |
| Carrinho | Finalizar pedido | Abre o formulário de checkout |
| Checkout | Entrega/Retirada | Alterna o tipo de atendimento e controla o campo de endereço |
| Checkout | Na entrega/retirada ou Pix pelo WhatsApp | Define a forma de pagamento e a inclui no resumo enviado |
| Checkout | Enviar pelo WhatsApp | Valida campos e abre o resumo formatado no WhatsApp |
| Admin | Entrar | Inicia o login protegido |
| Admin | Alternar status | Persiste aberto/fechado no banco |
| Admin | Nova categoria/Editar/Remover | Abre formulário, atualiza ou remove categorias via tRPC protegido |
| Admin | Novo item/Editar/Ativar/Desativar/Remover | Abre formulário, persiste alterações, alterna disponibilidade ou remove produtos |

A revisão encontrou ações conectadas para os controles da experiência construída. Foi feita uma revisão dirigida do trecho completo da Home.tsx: filtros alteram `activeCategory`, adicionar chama `addToCart`, a barra abre `cartOpen`, mais/menos chamam `changeQuantity`, remover filtra o carrinho, continuar alterna `checkoutOpen`, entrega/retirada alteram `fulfillment`, pagamento altera `payment`, o formulário valida e chama `sendOrder`, e o link final abre o WhatsApp. Clientes não precisam de login; somente o painel administrativo permanece protegido. Os controles administrativos também foram revisados no Admin.tsx: login, retry, status, CRUD de categorias e CRUD/disponibilidade de produtos estão ligados a handlers ou mutações tRPC. Os produtos reais ainda não foram publicados porque os nomes comerciais, descrições, preços e porções não aparecem nas fotos e aguardam confirmação da Cantina.
