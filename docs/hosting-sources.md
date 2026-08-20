# Fontes oficiais consultadas sobre hospedagem

- Vercel — Express on Vercel: https://vercel.com/docs/frameworks/backend/express
  - Express pode ser implantado na Vercel como uma Vercel Function; `express.static()` não serve assets na Vercel, que devem estar em `public/**`.
  - A aplicação Express vira uma única Function e está sujeita aos limites de Functions.

- Vercel — Node.js Runtime: https://vercel.com/docs/functions/runtimes/node-js
  - A Vercel aceita entrypoints Node/TypeScript e detecta `server`, `app` ou funções em `/api`.
  - `pnpm-lock.yaml` faz a Vercel usar pnpm para instalar dependências.

- Hostinger — Deploy Node.js website: https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
  - Node.js Web Apps estão disponíveis nos planos Business e Cloud listados pela Hostinger.
  - O serviço aceita React/Vite no frontend e Express no backend, com configuração de output e entry file.
  - Deploy por GitHub ou upload é suportado conforme o plano.

- HostGator — Compatible Technologies: https://www.hostgator.com/help/article/hg-compatible-technologies
  - A compatibilidade varia por Shared/Reseller versus VPS/Dedicated; a página oficial lista Node.js como tecnologia dependente do tipo de servidor e não garante suporte igual em hospedagem compartilhada.

Observação: estas fontes foram consultadas em 20 de agosto de 2026. A auditoria do projeto deve ser combinada com a configuração concreta do plano do provedor.
