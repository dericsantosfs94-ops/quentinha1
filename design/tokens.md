# Design tokens — Cantina do Chalé

A interface combina a energia cítrica do laranja `#FF6B35` com fundos terrosos e superfícies de papel quente. O movimento usa a personalidade **Breathe**: entradas suaves, pequenos ressaltos físicos e respeito a `prefers-reduced-motion`.

| Token | Valor | Uso |
|---|---|---|
| `brand-clay` | `#FF6B35` | CTA, preço em destaque, foco e elementos de ação |
| `brand-ember` | `#8B1E23` | Header, hero, footer e estados fortes |
| `brand-honey` | `#F2B84B` | Badges, ícones de categoria e detalhes |
| `brand-rose` | `#D6336C` | Gradiente pontual e pequenos acentos |
| `surface-paper` | `#FFF8EF` | Fundo principal |
| `surface-card` | `#FFFFFF` | Cards e campos |
| `ink` | `#2B211D` | Texto principal |
| `muted` | `#765E54` | Texto auxiliar |
| `success` | `#2E7D5B` | Restaurante aberto e confirmação |
| `danger` | `#A83232` | Erros e indisponibilidade |

A tipografia de display usa **Bree Serif**, com personalidade de letreiro artesanal sem comprometer a leitura. O corpo usa **Nunito Sans**, com formas abertas para leitura em telas pequenas. Nenhuma fonte script é usada em texto operacional: o tratamento artesanal fica reservado à marca e aos títulos.

## Regras de composição

A grade segue uma base de 8 px, com seções generosas e blocos assimétricos para evitar uma aparência genérica. Cards recebem cantos levemente orgânicos, sombras curtas e uma linha âmbar discreta. A home usa um hero de bordô com textura radial, uma faixa de categorias rolável e um catálogo em 1 coluna no celular e 2–3 colunas em telas maiores.

## Movimento

A personalidade Breathe usa `cubic-bezier(0.34, 1.56, 0.64, 1)` em interações de baixa frequência. Entradas de produtos aparecem em cascata curta; botões respondem com `scale(0.97)` no pressionamento. Conteúdo essencial permanece instantâneo e todas as animações são desativadas para usuários que preferem movimento reduzido.

## Contraste e acessibilidade

Texto de corpo usa `ink` sobre `surface-paper` ou branco sobre `brand-ember`. O CTA laranja usa texto escuro para manter leitura confortável. Foco visível, alvos de toque mínimos de 44 px e `aria-live` no contador do carrinho são obrigatórios.
