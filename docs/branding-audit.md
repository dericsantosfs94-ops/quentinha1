# Auditoria de branding

A varredura do repositório foi executada após a integração da logo enviada pelo usuário. Não foram encontrados arquivos de imagem locais no código da aplicação; a única imagem persistente usada pela interface é a logo oficial armazenada em `/manus-storage/logo_d54b5be6.png`.

| Área revisada | Resultado |
|---|---|
| Cabeçalho da home | Usa a logo oficial com texto alternativo `Cantina do Chalé Restaurante` |
| Painel administrativo | Usa a mesma logo oficial |
| Favicon | Usa a mesma logo oficial |
| Open Graph | Usa a mesma logo oficial |
| Conteúdo e documentação | Não há referências a logos alternativas ou arquivos visuais antigos |
| Componentes do scaffold | Não são usados como branding da Cantina do Chalé |

A auditoria final em `docs/branding-audit-full.txt` contém 2.293 linhas porque inclui imports, comentários, URLs e trechos do scaffold que usam palavras genéricas como `logo`, `image` e extensões de arquivos. A revisão específica de assets confirmou `image_files=0` no repositório, três referências oficiais em `client/index.html`, `client/src/pages/Home.tsx` e `client/src/pages/Admin.tsx`, e nenhuma referência aos nomes dos arquivos anexados anteriormente (`pasted_file_*`, `bkHblO` ou `jkmhKi`). As ocorrências em `server/_core/imageGeneration.ts` são infraestrutura genérica de geração de imagens, não branding do restaurante. As ocorrências de “Legacy” em `shared/const.ts` são comentários de compatibilidade técnica, não uma logo antiga. Portanto, não há asset ou referência visual antiga da Cantina a substituir; as referências visuais da marca estão centralizadas no mesmo caminho persistente.
