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
