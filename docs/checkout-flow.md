# Fluxo de pedido

O cliente percorre o cardápio, adiciona itens ao carrinho e acompanha o subtotal em tempo real. No checkout, informa o nome, escolhe entre entrega e retirada, fornece o endereço quando necessário, escolhe pagamento na entrega/retirada ou Pix pelo WhatsApp e pode acrescentar observações. Nenhuma etapa exige conta ou login do cliente.

A aplicação não processa pagamento nem cria checkout próprio. Ao enviar, abre exclusivamente `https://api.whatsapp.com/send` para o número comercial da Cantina (`5521988678298`) com o resumo do pedido pré-preenchido. O cliente revisa e envia a mensagem no próprio WhatsApp; a confirmação final continua sob responsabilidade do restaurante.

O status aberto/fechado vem da tabela `restaurant_settings`, é alterável pelo administrador e é exibido no hero. Quando a consulta pública ainda não possui configuração persistida, a interface assume aberto apenas como estado inicial de disponibilidade visual, sem bloquear o contato.

## Eventos

A home dispara `add_to_cart` quando um item é adicionado e `begin_checkout` quando o cliente entra no fluxo de envio. Os eventos são publicados como `CustomEvent` para integração com o analytics do projeto, sem hardcode de pixels de terceiros.
