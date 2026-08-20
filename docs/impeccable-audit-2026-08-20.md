# Auditoria Impeccable — Cantina do Chalé

## Escopo e método

A auditoria cobriu a Home pública e o painel administrativo, com inspeção do código em `client/src/pages/Home.tsx`, `client/src/pages/Admin.tsx`, `client/src/index.css` e `client/index.html`, checagens estáticas direcionadas, validação de TypeScript, build de produção, teste Playwright do carrinho e capturas em desktop, mobile e tablet paisagem. O detector mecânico `npx impeccable audit --target client/src/pages/Home.tsx` não retornou dentro de quatro minutos e foi encerrado; por isso, os achados abaixo foram verificados diretamente no código e no runtime disponível, sem tratar a ausência do detector como um achado do produto.

## Audit Health Score

| Dimensão | Nota | Evidência principal |
|---|---:|---|
| Acessibilidade | 3/4 | Imagens principais têm `alt`, foco visível existe, controles recebem alvos mínimos; falta uma validação automatizada completa de contraste/teclado e o modal não evidencia foco inicial. |
| Performance | 3/4 | Imagens de produtos usam `loading="lazy"`, o build passa e não há dependência de motion nova; o bundle principal continua acima de 500 kB após minificação. |
| Responsive Design | 4/4 | `viewport-fit=cover`, safe areas, `pointer: coarse`, `hover: none`, flex-wrap no admin e validação em 375 px, 768×500 px e 1280×720 px. |
| Theming | 3/4 | Paleta oficial consistente e documentada; ainda existem cores hexadecimais aplicadas diretamente em JSX, em vez de tokens semânticos centralizados. |
| Implementation Integrity | 3/4 | A interface mantém o sistema específico da Cantina, logo/capa oficiais, carrinho e admin; o componente Home/Admin ainda concentra muito markup inline, dificultando manutenção e auditoria futura. |
| **Total** | **16/20** | **Good — melhorias pontuais recomendadas, sem bloqueio de publicação.** |

## Veredito de integridade

**Passa com ressalvas.** A implementação expressa um sistema coerente e específico para a Cantina do Chalé: hero com capa oficial, paleta bordô/âmbar, cardápio com fotos reais, carrinho, WhatsApp e painel protegido. Não foram encontrados depoimentos, avaliações ou conteúdo de usuário inventado. O principal risco de manutenção é a concentração de JSX em linhas extensas e o uso repetido de cores literais.

## Achados por severidade

### [P2] Foco inicial e retorno de foco nos overlays

**Localização:** `client/src/pages/Home.tsx` e `client/src/pages/Admin.tsx`, overlays de carrinho, checkout e formulários administrativos.

**Categoria:** Acessibilidade.

**Impacto:** Usuários de teclado e leitores de tela podem abrir um overlay sem receber foco imediatamente no título, primeiro campo ou botão de fechar. O diálogo tem `role="dialog"` e `aria-modal`, mas não há evidência de gerenciamento de foco nem retorno para o gatilho ao fechar.

**Recomendação:** Adicionar foco inicial no botão de fechar ou no primeiro campo e devolver foco ao gatilho que abriu o overlay. Manter o bloqueio de foco enquanto o modal estiver aberto.

### [P2] Bundle principal acima de 500 kB

**Localização:** build Vite de produção.

**Categoria:** Performance.

**Impacto:** O build gera um bundle JavaScript principal de aproximadamente 951 kB antes de gzip, com aviso do Vite sobre chunks acima de 500 kB. Em aparelhos móveis de baixo desempenho, isso pode aumentar o tempo de parse e hidratação percebida.

**Recomendação:** Separar o painel `/admin` por `lazy`/dynamic import e carregar componentes administrativos somente na rota protegida. Não é bloqueador do catálogo atual, pois o build e o teste funcional passam.

### [P2] Cores literais repetidas no JSX

**Localização:** `Home.tsx` e `Admin.tsx`.

**Categoria:** Theming/manutenibilidade.

**Impacto:** A paleta está coerente, mas alterações futuras de marca exigem editar muitas classes diretamente e podem criar divergências entre Home e Admin.

**Recomendação:** Migrar gradualmente bordô, âmbar, dourado, creme e texto para tokens semânticos CSS, preservando os valores atuais.

### [P3] Markup de superfície excessivamente concentrado

**Localização:** `Home.tsx` e `Admin.tsx`.

**Categoria:** Implementation Integrity.

**Impacto:** O markup em linhas extensas dificulta revisão, testes de estados isolados e evolução do painel, embora não tenha causado erro no TypeScript, build ou Playwright.

**Recomendação:** Extrair componentes de produto, carrinho, checkout, categoria e formulário administrativo em etapas futuras, sem alterar o comportamento.

## Pontos positivos

A Home é pública sem login, o painel está separado e protegido, e o checkout segue exclusivamente pelo WhatsApp. Os oito produtos mantêm fotos reais e o carrinho foi validado com o produto `Risoto de camarão`, imagem carregada e subtotal de R$ 50,00. A adaptação responsiva cobre safe areas, ponteiro de toque, ausência de hover e orientação paisagem. O movimento respeita `prefers-reduced-motion`, e os assets de branding apontam para a logo e capa oficiais do Supabase Storage.

## Validações executadas

| Validação | Resultado |
|---|---|
| `pnpm check` | Passou, TypeScript sem erros |
| `pnpm build` | Passou; aviso não bloqueante de chunk grande |
| `pnpm test:e2e` | Passou com `Risoto de camarão`, imagem e subtotal R$ 50,00 |
| Captura 1280×720 | Passou, sem overflow visual no hero/cardápio |
| Captura 375×812 | Passou, categorias com rolagem horizontal e hero legível |
| Captura 768×500 | Passou, layout preservado em paisagem curta |
| Detector `npx impeccable audit` | Não concluiu dentro do limite operacional; substituído por inspeção verificada e runtime |

## Recomendações priorizadas

1. **P2 — `impeccable harden`:** implementar foco inicial, retorno de foco e tratamento completo dos diálogos do carrinho, checkout e admin.
2. **P2 — `impeccable optimize`:** dividir o bundle administrativo por carregamento sob demanda, depois medir novamente o build.
3. **P2 — `impeccable extract`:** centralizar os tokens de cor semânticos quando a próxima rodada de manutenção estrutural for autorizada.
4. **P3 — `impeccable polish`:** extrair componentes longos e fazer uma última revisão visual.

A recomendação é reexecutar `/impeccable audit` depois dessas correções para comparar a pontuação.
