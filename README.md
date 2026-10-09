# Premium Marmoraria — Landing Page

Projeto Next.js (App Router) + Tailwind CSS para uma marmoraria de alto padrão, baseado no layout enviado.

## Stack
- Next.js 14
- React 18
- Tailwind CSS 3
- lucide-react (ícones)
- next/font (Oswald para títulos, Inter para corpo de texto)
- next/image com imagens de exemplo do Unsplash (troque pelas fotos reais do cliente quando tiver)

## Estrutura
```
src/
  app/             -> paginas, layouts, estilos e rotas da API
  components/      -> componentes da interface
  lib/             -> logica e integracoes da aplicacao
  tests/           -> testes automatizados
public/            -> imagens e arquivos estaticos
```

## Como rodar

```bash
npm install
npm run dev
```

Depois abra http://localhost:3000

## Banco de dados (Prisma + Neon)
Schema em `prisma/schema.prisma`, migrations em `prisma/migrations`. O client é gerado em `src/generated/prisma` (não versionado; `npm install` e `npm run build` geram automaticamente).

Variáveis (veja `.env.example`; local em `.env.local`, na Vercel em Settings > Environment Variables):
- `DATABASE_URL`: URL com pooling do Neon, usada pelo app.
- `DATABASE_URL_UNPOOLED`: conexão direta, usada pelas migrations.

Comandos:
- `npm run db:migrate -- --name descricao`: cria uma migration após alterar o schema (desenvolvimento).
- `npm run db:deploy`: aplica as migrations pendentes.
- `npm run db:seed`: cadastra o conteúdo inicial do site (só roda se não houver nenhum item).
- `npm run db:studio`: abre o Prisma Studio para ver os dados.

Na Vercel, o script `vercel-build` aplica as migrations antes de cada build.

## Portal de conteúdo (`/portal`)
Cadastro de serviços, materiais, cases de sucesso e do banner da home, com fotos e vídeos (fotos até 10 MB, vídeos até 100 MB, enviados direto ao Cloudinary). O que estiver publicado aparece na home; o banner troca o fundo do topo do site, alternando entre os arquivos cadastrados.

Precisa também de:
- `AUTH_SECRET`: segredo da sessão, mín. 32 caracteres.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: envio das fotos do portal e das prévias geradas pela IA.

Orçamentos: todos os botões de WhatsApp do site abrem um formulário curto (serviço, metragem, pedra, cor e contato). O pedido fica salvo em `/portal/orcamentos`, com status e botão de resposta, e o cliente segue para o WhatsApp da empresa com a mensagem já organizada. O número usado é o do Perfil da empresa.

Primeiro acesso: abra `/portal/login` e crie o primeiro usuário. Depois disso, novos usuários só são criados por quem está logado, em `/portal/usuarios`.

Sem `DATABASE_URL`, a home continua funcionando com o conteúdo inicial.

## Build de produção
```bash
npm run build
npm run start
```

## Próximos passos sugeridos
- Trocar as imagens do Unsplash em `Hero.js`, `ProjectsGallery.js`, `Materials.js` e `CTABanner.js` por fotos reais dos projetos/materiais (coloque os arquivos em `public/` e atualize os `src`).
- Atualizar telefone do WhatsApp (`5511999999999`) em `Header.js`, `Hero.js`, `CTABanner.js` e `WhatsAppFloat.js`.
- Atualizar e-mail, endereço e horários no `Footer.js`.
- Integrar o mapa real (Google Maps embed) no lugar do placeholder "Mapa" no `Footer.js`.
- Conectar o formulário/CTA de orçamento a um backend ou serviço de e-mail, se desejar um form em vez de redirecionar para o WhatsApp.
