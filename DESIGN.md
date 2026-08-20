---
name: Cantina do Chalé
description: Cardápio digital de comida caseira com atendimento pelo WhatsApp.
colors:
  oxblood: "#8B1E23"
  orange: "#FF6B35"
  amber: "#F2B84B"
  magenta: "#D6336C"
  cream: "#FFF8EF"
  paper: "#FFFFFF"
  ink: "#2B211D"
  muted-ink: "#765E54"
  border: "#EAD5C1"
typography:
  display:
    fontFamily: "Georgia, Cambria, Times New Roman, serif"
    fontSize: "clamp(2rem, 6vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.2em"
rounded:
  sm: "0.75rem"
  md: "1rem"
  lg: "2rem"
  pill: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.25rem"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.oxblood}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1rem"
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "1.5rem"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.75rem"
---

# Design System: Cantina do Chalé

## Overview

**Creative North Star: “Receita de Família”**

A identidade visual da Cantina do Chalé deve parecer passada de mão em mão: comida caseira, memória afetiva e cuidado em cada detalhe. O sistema combina bordô profundo, laranja quente, dourado âmbar, papel creme e fotografia real dos pratos. A interface é acolhedora sem perder clareza operacional: o cliente precisa encontrar o cardápio, montar o pedido e seguir para o WhatsApp sem esforço.

A linguagem visual existente privilegia superfícies claras, bordas delicadas, cantos generosos e ações em formato de pílula. O hero usa a foto oficial de capa como protagonista; a logo circular oficial é o selo de autenticidade e não deve ser substituída por marcas genéricas. O painel administrativo usa a mesma base cromática, mas com maior densidade e foco em edição.

**Key Characteristics:**
- Artesanal e acolhedor, sem aparência genérica de aplicativo de delivery.
- Fotografia real como prova principal do cardápio.
- Bordô para marca e estrutura; laranja para ações; âmbar para destaque.
- Contraste alto e linguagem direta em todas as ações essenciais.

## Colors

A paleta é quente e terrosa, com o bordô como voz de marca, o laranja como gesto de ação e o creme como papel de fundo.

### Primary
- **Bordô da Cantina** (`#8B1E23`): marca, títulos fortes, hero estrutural, status e superfícies de destaque.
- **Laranja de Ação** (`#FF6B35`): botões primários, CTAs, controles de salvar e adicionar.

### Secondary
- **Âmbar de Cozinha** (`#F2B84B`): ícones, microdestaques, labels e sinais de atenção positiva.
- **Magenta de Apoio** (`#D6336C`): detalhe secundário presente no anel da logo e em acentos pontuais.

### Neutral
- **Papel Creme** (`#FFF8EF`): fundo geral e áreas de respiro.
- **Branco de Louça** (`#FFFFFF`): cards, formulários e superfícies de leitura.
- **Tinta de Café** (`#2B211D`): texto sobre laranja e texto escuro de alta prioridade.
- **Marrom Suave** (`#765E54`): descrições e texto auxiliar.
- **Borda de Cerâmica** (`#EAD5C1`): contornos, divisores e campos.

### Named Rules
**A Regra do Tempero.** O laranja deve aparecer nas ações que pedem movimento; o bordô deve sustentar a marca; o âmbar deve temperar, nunca dominar a interface.

## Typography

**Display Font:** Georgia, Cambria, Times New Roman, serif.
**Body Font:** Inter, ui-sans-serif, system-ui, sans-serif.
**Label/Mono Font:** A sans-serif de interface com tracking expandido para labels de seção.

**Character:** A tipografia de display traz tradição editorial e sensação de receita impressa; a sans-serif mantém preços, formulários e ações legíveis em telas pequenas.

### Hierarchy
- **Display** (700, `clamp(2rem, 6vw, 4rem)`, 1.05): hero, títulos principais e nomes de seções.
- **Headline** (700, aproximadamente 1.875–2.25rem, 1.1): títulos de cardápio, painel e blocos de destaque.
- **Title** (700, 1–1.25rem, 1.25): nomes de produto, categorias e títulos de cards.
- **Body** (400, 1rem, 1.5): descrições, instruções e conteúdo de apoio.
- **Label** (800, 0.75rem, 1.2, tracking 0.2em, uppercase): marcadores como “Cardápio”, “Administração” e status.

### Named Rules
**A Regra da Receita Legível.** Display cria memória; body resolve a tarefa. Nunca usar a fonte decorativa ou serifada para campos, preços, botões ou mensagens de erro.

## Layout

A Home usa uma composição mobile-first com container centralizado e padding lateral aproximado de 1.25rem em telas pequenas, ampliando para 2rem em telas maiores. O cardápio organiza categorias e produtos em blocos empilhados no mobile e em grids mais largos no desktop. O painel admin usa duas colunas em telas grandes: controles/status e categorias à esquerda; catálogo e edição à direita.

O hero deve manter a foto de capa como superfície dominante, com conteúdo legível diretamente sobre a imagem. O cardápio começa logo abaixo do hero. O endereço oficial pertence às seções finais de atendimento/localização, não deve reaparecer como uma pílula no hero. O carrinho móvel permanece fixo no rodapé quando há itens e modais de edição usam altura limitada com rolagem interna.

## Elevation & Depth

O sistema usa profundidade híbrida: bordas suaves e diferenças de tonalidade fazem o trabalho principal, enquanto sombras discretas sustentam logo, cards e elementos flutuantes. O fundo creme separa-se do branco dos cards; o bordô cria âncoras de alta importância; o laranja sinaliza interação. Evitar sombras pesadas que façam a interface parecer um marketplace genérico.

### Shadow Vocabulary
- **Logo lift:** sombra suave e quente sob a logo circular.
- **Card separation:** sombra baixa e difusa apenas quando um card precisa se destacar do fundo.
- **Modal focus:** overlay escuro e superfície creme/branca elevada para edição e checkout.

## Shapes

A linguagem de forma é arredondada e tátil. Cards principais usam raio amplo próximo de 2rem; inputs e pequenos controles usam raios de 0.75–1rem; CTAs importantes usam formato pill. Bordas são finas, claras e quentes, como cerâmica ou papel encorpado. A logo circular permanece circular e deve conservar o anel gradiente e o selo bordô.

## Components

### Buttons
- **Shape:** pílula para ações primárias; raio médio para controles compactos e ícones.
- **Primary:** laranja `#FF6B35`, texto tinta `#2B211D`, padding confortável e peso forte.
- **Hover / Focus:** aumentar contraste e preservar foco visível; não depender apenas de cor.
- **Secondary / Ghost:** superfície branca com borda de cerâmica e texto bordô; usar para voltar, editar ou ações secundárias.

### Cards / Containers
- **Corner Style:** raio amplo, especialmente nos blocos de hero, cards de produto, carrinho e painel.
- **Background:** branco sobre papel creme; bordô reservado para status e chamadas de marca.
- **Shadow Strategy:** tonalidade e borda primeiro; sombra discreta apenas para hierarquia.
- **Border:** `#EAD5C1` em contorno fino.
- **Internal Padding:** 1–1.5rem em cards comuns; até 2rem em painéis principais.

### Inputs / Fields
- **Style:** fundo branco, borda quente, texto tinta, raio médio e altura mínima confortável para toque.
- **Focus:** borda/anel âmbar visível, sem depender de mudança sutil de cor.
- **Error / Disabled:** mensagem explícita próxima ao campo; estados desabilitados devem manter leitura e não parecer botão quebrado.

### Navigation
- **Style:** navegação pública discreta e contextual; o cardápio é a ação principal e aparece logo após o hero. O acesso admin permanece discreto e separado.
- **Mobile:** priorizar rolagem vertical, carrinho fixo quando necessário e modais com rolagem interna.

### Logo & Photography
A logo oficial circular é o selo visual da marca. Fotografias reais dos pratos são o conteúdo de prova e devem usar `object-cover` sem distorção. URLs técnicas do Supabase pertencem apenas ao painel de edição; nunca devem aparecer no cardápio público.

## Do's and Don'ts

### Do:
- **Do** preservar a logo oficial, a foto de capa e as fotos reais dos produtos.
- **Do** usar bordô para marca e estrutura, laranja para ação e âmbar para destaque.
- **Do** manter o cardápio imediatamente abaixo do hero e o endereço nas seções finais.
- **Do** manter foco visível, alvos de toque confortáveis e texto legível sobre fotografias.
- **Do** usar linguagem acolhedora e direta, conectada a comida caseira e WhatsApp.

### Don't:
- **Don't** substituir a identidade por azul, roxo ou padrões genéricos de SaaS/delivery.
- **Don't** colocar o endereço ou CTAs redundantes sobre a foto quando o cardápio já está logo abaixo.
- **Don't** expor URLs do Supabase ao cliente final.
- **Don't** usar avaliações, depoimentos ou dados de clientes inventados.
- **Don't** esconder ações administrativas atrás de cliques ambíguos; seleção e edição devem ter alvos distintos.
