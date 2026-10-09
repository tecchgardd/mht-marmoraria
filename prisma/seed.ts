import { config } from 'dotenv';

config({ path: ['.env.local', '.env'], quiet: true });

async function main() {
  // Imported after loading env, since the client reads DATABASE_URL.
  const { createContent } = await import('../src/lib/content/repository');
  const { getPrisma } = await import('../src/lib/prisma');
  const { defaultContent } = await import('../src/lib/content/defaults');

  const prisma = getPrisma();
  try {
    if ((await prisma.contentItem.count()) > 0) {
      console.log('Conteúdo já existe, seed ignorado.');
      return;
    }
    for (const item of defaultContent) {
      await createContent(item);
    }
    console.log(`Seed concluído: ${defaultContent.length} itens.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
