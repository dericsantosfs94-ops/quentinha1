# Evidências visuais — adapt

As capturas desktop (1280×720) e mobile retrato (375×812) mostram o hero preservado, a logo/capa oficiais intactas, o título legível e as categorias com rolagem horizontal sem overflow da página. O recorte do hero permanece controlado no mobile e os alvos de toque das categorias seguem confortáveis. A validação determinística também passou com TypeScript, build e Playwright do carrinho.

A adaptação aplicada inclui `viewport-fit=cover`, safe areas laterais, alvos mínimos para ponteiro coarse, neutralização de hover em dispositivos sem hover, flex-wrap em linhas de produto/upload do admin e uma regra específica para orientação paisagem curta.
