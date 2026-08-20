# Evidência runtime publicada

Fonte: https://cantinadochale.vercel.app/

Em 20/08/2026, o domínio público carregou a Home sem login, com título `Cantina do Chalé — Pedidos Online`, logo oficial, capa oficial, categorias e oito produtos reais. O conteúdo extraído apresentou `Risoto de camarão`, `Galinha ao molho Caipira`, `Carne ao molho com aipim`, `Carne acebolada com fritas`, `Carne assada com barata corada`, `costelinha ao molho`, `Bife com fritas e salada` e `Carne ao molho com batatas`, todos com preço exibido de R$ 25,00.

Também foram observados o endereço `Rua Malvino Ferreira de Andrade, 689 — Santo Aleixo, Magé — RJ`, a área de cobertura e o link `Área administrativa`. A listagem textual confirmou os botões `Adicionar`. Em execução Playwright posterior, fora do overlay, o checkout foi aberto sem login, `Pix via WhatsApp` foi selecionado e o envio foi interceptado via `window.open`: a URL capturada começou por `https://api.whatsapp.com/send`, sem abrir conversa externa real. Naquela execução, o catálogo retornou a loja aberta e o botão de envio estava habilitado.
