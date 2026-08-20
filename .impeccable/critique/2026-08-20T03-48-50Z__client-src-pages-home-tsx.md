---
target: client/src/pages/Home.tsx
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-08-20T03-48-50Z
slug: client-src-pages-home-tsx
---
⚠️ DEGRADED: single-context (sub-agent tool unavailable in this session)

# Crítica de UX e Design — Cantina do Chalé

## Design Health Score

| # | Heurística | Score | Questão principal |
|---|---|---:|---|
| 1 | Visibilidade do estado do sistema | 3/4 | O estado da loja aparece no hero e no admin, mas o carregamento inicial fica tempo demais em “Preparando o cardápio…” quando a API demora. |
| 2 | Correspondência com o mundo real | 4/4 | A linguagem de comida caseira, categorias, fotos reais e pedido pelo WhatsApp são coerentes com a cantina. |
| 3 | Controle e liberdade do usuário | 2/4 | O cliente tem carrinho e filtros; no admin, seleção de categoria e edição precisam permanecer explicitamente separados e as ações destrutivas precisam de feedback/undo mais claro. |
| 4 | Consistência e padrões | 3/4 | Bordô, laranja, creme, pills e cards formam um sistema reconhecível, mas há densidade e microvariações entre Home e admin. |
| 5 | Prevenção de erros | 2/4 | O formulário admin precisa prevenir melhor colisões de ID, salvar sem feedback ambíguo e explicar o impacto de remover foto/item. |
| 6 | Reconhecimento em vez de lembrança | 3/4 | Categorias e ações têm rótulos visíveis; alguns controles de ícone, especialmente lixeira, dependem de tooltip/hint. |
| 7 | Flexibilidade e eficiência | 2/4 | Filtros públicos ajudam, mas o admin exige muita rolagem e ações repetitivas por produto. |
| 8 | Estética e design minimalista | 3/4 | O hero é forte e específico; o admin pode reduzir repetição visual e melhorar a relação entre painel de categorias e catálogo. |
| 9 | Ajuda para reconhecer e recuperar erros | 2/4 | Erros de API e upload precisam aparecer junto da ação e oferecer caminho claro de recuperação, sem depender de alertas nativos. |
| 10 | Ajuda e documentação | 2/4 | O cliente entende o fluxo principal, mas o admin não oferece orientação contextual suficiente para status, fotos, opções e exclusão. |
| **Total** |  | **26/40** | **Sistema com identidade forte, mas com oportunidades importantes de operação e recuperação de erro.** |

## Design Specificity Verdict

**Veredito: authored for this product, com ressalvas operacionais.** A combinação de foto de comida como hero, logo circular oficial, bordô, laranja, dourado e linguagem “Aquecendo corações desde 2013” não parece um template genérico. A metáfora “Receita de Família” é visível na fotografia, nos tons quentes e na tipografia editorial. O principal risco não é falta de personalidade; é deixar a operação do admin com aparência de CRUD genérico e esconder feedback de ações críticas.

**Deterministic scan:** o detector automático foi tentado em `client/src/pages/Home.tsx` e `client/src/pages/Admin.tsx`, mas o script informou `Error: bundled detector not found`. Portanto, não há contagem confiável de regras automáticas nem overlay determinístico nesta execução. A inspeção visual do domínio publicado foi realizada no navegador.

## Overall Impression

A Home comunica comida caseira com autoridade: o hero fotográfico domina, a logo é reconhecível e o cardápio aparece sem rodeios. A maior oportunidade é transformar essa boa primeira impressão em uma jornada mais inequívoca: reduzir estados de espera, tornar o próximo passo do pedido ainda mais óbvio e fazer o admin transmitir segurança em cada mutação.

## What's Working

Primeiro, a identidade é específica e coerente. A foto de capa, a logo e os tons quentes dão à Cantina um ponto de vista que um restaurante diferente não poderia copiar sem perder a própria verdade. Segundo, a organização do cardápio é legível: filtros por categoria, nome, descrição, preço e botão “Adicionar” permitem escanear rapidamente. Terceiro, o admin mostra status, categorias, catálogo e ações no mesmo espaço, o que reduz navegação entre telas.

## Priority Issues

### [P1] O estado de carregamento inicial ocupa a tela inteira sem progresso contextual

**Por que importa:** no domínio publicado, a primeira captura mostrou “Preparando o cardápio…” em uma tela vazia antes do conteúdo chegar. Em conexão lenta, isso parece quebra ou site sem produtos.

**Correção:** usar skeletons de hero/cardápio, manter a marca em uma composição estável e mostrar uma mensagem de erro acionável após timeout, com botão “Tentar novamente”.

**Suggested command:** `harden` ou `polish`.

### [P1] O admin ainda concentra ações destrutivas e mutações de alto impacto com feedback insuficiente

**Por que importa:** status, remoção, upload, remoção de foto e salvar produto alteram o catálogo real. O histórico recente mostrou erro de chave duplicada e cliques que pareciam não funcionar, o que indica baixo grau de confiança operacional.

**Correção:** usar confirmação contextual para apagar, estado de “salvando/salvo”, toast não nativo com mensagem específica, rollback visual e indicação de qual item foi afetado. Para lixeira, incluir nome do item no diálogo e possibilidade de desfazer quando possível.

**Suggested command:** `harden`.

### [P1] O painel admin tem densidade alta e ações repetidas pouco agrupadas

**Por que importa:** no desktop, cada produto repete “Desativar”, “Editar” e lixeira em uma linha estreita; no mobile, isso pode exigir muita rolagem e aumentar o risco de tocar na ação errada.

**Correção:** agrupar ações em um menu contextual por item, manter “Editar” como ação primária e deixar exclusão em zona visualmente separada. Fixar o contexto da categoria selecionada no topo do catálogo.

**Suggested command:** `layout` e depois `harden`.

### [P2] A Home tem boa descoberta de categoria, mas o CTA de compra pode aparecer tarde demais

**Por que importa:** o cardápio inicia logo abaixo do hero, o que respeita a decisão anterior de não usar botões redundantes; porém, em telas maiores, o usuário ainda precisa localizar o primeiro produto e entender que “Adicionar” inicia o pedido.

**Correção:** manter o hero sem botões redundantes, mas usar uma microfrase de orientação junto ao título do cardápio e uma indicação persistente do carrinho quando o primeiro item for adicionado.

**Suggested command:** `clarify`.

## Persona Red Flags

**Cliente no celular, primeira visita:** pode interpretar “Preparando o cardápio…” como falha se a API demorar. Também precisa entender rapidamente que “Adicionar” cria um pedido para WhatsApp, não uma compra online tradicional.

**Cliente recorrente com pressa:** precisa de filtros e carrinho persistente; a estrutura é boa, mas fotografias e estados de carregamento devem não deslocar o conteúdo. O endereço no final está correto, porém a área de entrega precisa continuar encontrável sem competir com o cardápio.

**Operador da cantina:** encontra status, categorias e catálogo, mas enfrenta risco de erro em ações destrutivas, upload e salvamento. A separação entre selecionar categoria e clicar em “Editar” é fundamental e deve continuar explícita.

## Minor Observations

A Home exibe alguns textos provisórios nas descrições de produtos; isso enfraquece a sensação de cardápio final e deve ser substituído apenas por conteúdo oficial. O status “Fechado agora” é importante, mas merece uma mensagem pública mais orientadora, explicando se o cliente pode montar o pedido para outro horário. A lixeira somente com ícone precisa de aria-label, tooltip e foco visível. O admin usa um padrão de duas colunas forte no desktop, mas precisa de uma revisão específica em 375px para garantir que os três controles por item não fiquem apertados.

## Questions to Consider

1. Você prefere que a próxima melhoria priorize **A. operação segura do admin**, com feedback, confirmação e upload; **B. velocidade da Home**, com loading/error states e carrinho mais evidente; ou **C. revisão mobile**, focada em 375px?
2. No admin, a exclusão deve ser **A. definitiva com confirmação**, **B. arquivamento/desativação reversível**, ou **C. confirmação mais desfazer por alguns segundos**?
3. Para o cliente, o estado “Fechado agora” deve **A. bloquear apenas o envio**, **B. permitir montar o carrinho e avisar no WhatsApp**, ou **C. esconder os botões de adicionar enquanto fechado**?
