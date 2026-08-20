# Evidência runtime publicada

Fonte: https://cantinadochale.vercel.app/

Em 20/08/2026, o domínio público carregou a Home sem login, com título `Cantina do Chalé — Pedidos Online`, logo oficial, capa oficial, categorias e oito produtos reais. O conteúdo extraído apresentou `Risoto de camarão`, `Galinha ao molho Caipira`, `Carne ao molho com aipim`, `Carne acebolada com fritas`, `Carne assada com barata corada`, `costelinha ao molho`, `Bife com fritas e salada` e `Carne ao molho com batatas`, todos com preço exibido de R$ 25,00.

Também foram observados o endereço `Rua Malvino Ferreira de Andrade, 689 — Santo Aleixo, Magé — RJ`, a área de cobertura e o link `Área administrativa`. A listagem textual confirmou os botões `Adicionar`. Em execução Playwright posterior, fora do overlay, o checkout foi aberto sem login, `Pix via WhatsApp` foi selecionado e o envio foi interceptado via `window.open`: a URL capturada começou por `https://api.whatsapp.com/send`, sem abrir conversa externa real. Naquela execução, o catálogo retornou a loja aberta e o botão de envio estava habilitado.

## Validação autenticada do admin

Com uma sessão administrativa já autenticada no domínio publicado, a rota `/admin` abriu diretamente o painel, sem redirecionamento para Manus OAuth. O painel exibiu status, quatro categorias, oito produtos reais e controles de editar/ativar/remover. Clicar em `Pratos caseiros` mudou o painel para `Editando Pratos caseiros`, exibiu `8 item(ns)` e manteve o catálogo intacto; nenhum dado foi alterado ou excluído.
 O botão explícito `Editar` abriu o diálogo `Editar categoria` com nome, slug, ícone e `Salvar categoria`; o diálogo foi fechado sem salvar. A validação não alterou nenhum registro.
 A seleção de `Acompanhamentos` exibiu `Editando Acompanhamentos` e `0 item(ns)`; a seleção de `Bebidas` exibiu `Editando Bebidas` e `0 item(ns)`. Ambos os estados foram observados sem mutação.
 A seleção de `Sobremesas` exibiu `Editando Sobremesas` e `0 item(ns)`. Com isso, as quatro categorias foram exercitadas no admin publicado; nenhuma alteração, exclusão ou salvamento foi executado.
 A sessão autenticada também abriu `Editar item` para `Risoto de camarão`. Foram observados os campos nome, categoria, descrição, preço, URL da foto, remover foto, upload de foto, disponibilidade, Cardápio do dia e o editor de opções/complementos com nome, descrição, adicional e disponibilidade. O diálogo foi somente inspecionado e fechado sem salvar.
 O botão `Alternar status` respondeu no admin publicado: após o clique, o painel passou de `Fechado agora` para `Aberto agora`, mantendo os oito produtos e controles intactos.
 O status foi restaurado para `Fechado agora` após o segundo clique, deixando a loja no mesmo estado inicial. O teste do controle foi reversível e não alterou produtos, categorias ou opções.
 No storefront publicado, o filtro `Pratos caseiros` foi selecionado sem login; o botão ficou ativo em bordô e a seção de produtos permaneceu no fluxo correto. O handler de seleção de categoria respondeu sem navegação ou login.
 O teste publicado dos cinco filtros passou: `Tudo` (8 cards), `Pratos caseiros` (8), `Acompanhamentos` (0), `Bebidas` (0) e `Sobremesas` (0). Cada botão assumiu o estado ativo em bordô; os estados vazios das três últimas categorias foram renderizados sem erro.
