import type { ContentImage as ContentImageRow, ContentItem as ContentItemRow } from '../../generated/prisma/client';
import { ContentKind as DbContentKind, MediaType as DbMediaType } from '../../generated/prisma/enums';
import { getPrisma, isDatabaseConfigured, isUuid } from '../prisma';
import { defaultContent } from './defaults';
import type { ContentImage, ContentInput, ContentItem, ContentKind } from './types';

const toDbKind: Record<ContentKind, DbContentKind> = {
  service: DbContentKind.SERVICE,
  material: DbContentKind.MATERIAL,
  case: DbContentKind.CASE,
  banner: DbContentKind.BANNER,
};

const fromDbKind: Record<DbContentKind, ContentKind> = {
  SERVICE: 'service',
  MATERIAL: 'material',
  CASE: 'case',
  BANNER: 'banner',
};

const withImages = { images: { orderBy: { position: 'asc' } } } as const;

function toItem(row: ContentItemRow & { images: ContentImageRow[] }): ContentItem {
  return {
    id: row.id,
    kind: fromDbKind[row.kind],
    title: row.title,
    category: row.category,
    summary: row.summary,
    description: row.description,
    features: row.features,
    images: row.images.map((image) => ({
      url: image.url,
      type: image.type === DbMediaType.VIDEO ? 'video' : 'image',
      ...(image.publicId ? { publicId: image.publicId } : {}),
    })),
    published: row.published,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function imageRows(images: ContentImage[]) {
  return images.map((image, position) => ({
    url: image.url,
    publicId: image.publicId ?? null,
    type: image.type === 'video' ? DbMediaType.VIDEO : DbMediaType.IMAGE,
    position,
  }));
}

function fallbackItems(kind: ContentKind): ContentItem[] {
  return defaultContent
    .filter((item) => item.kind === kind)
    .map((item, index) => ({ ...item, id: `default-${kind}-${index}`, createdAt: '', updatedAt: '' }));
}

// Public site: never breaks the page if the database is missing or down.
export async function getPublishedContent(kind: ContentKind): Promise<ContentItem[]> {
  if (!isDatabaseConfigured()) return fallbackItems(kind);

  try {
    const rows = await getPrisma().contentItem.findMany({
      where: { kind: toDbKind[kind], published: true, images: { some: {} } },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: withImages,
    });
    return rows.map(toItem);
  } catch (error) {
    console.error('Falha ao carregar conteúdo do banco:', error);
    return fallbackItems(kind);
  }
}

export async function listContent(kind: ContentKind) {
  const rows = await getPrisma().contentItem.findMany({
    where: { kind: toDbKind[kind] },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: withImages,
  });
  return rows.map(toItem);
}

export async function getContent(id: string) {
  if (!isUuid(id)) return null;
  const row = await getPrisma().contentItem.findUnique({ where: { id }, include: withImages });
  return row ? toItem(row) : null;
}

export async function createContent(input: ContentInput) {
  const { kind, images, ...data } = input;
  const row = await getPrisma().contentItem.create({
    data: { ...data, kind: toDbKind[kind], images: { create: imageRows(images) } },
    include: withImages,
  });
  return toItem(row);
}

export async function updateContent(id: string, input: Omit<ContentInput, 'kind'>) {
  if (!isUuid(id)) return null;
  const { images, ...data } = input;
  const prisma = getPrisma();

  const exists = await prisma.contentItem.count({ where: { id } });
  if (!exists) return null;

  // Images are replaced as a whole to keep the order chosen in the portal.
  const row = await prisma.contentItem.update({
    where: { id },
    data: { ...data, images: { deleteMany: {}, create: imageRows(images) } },
    include: withImages,
  });
  return toItem(row);
}

export async function deleteContent(id: string) {
  if (!isUuid(id)) return null;
  const item = await getContent(id);
  if (!item) return null;
  await getPrisma().contentItem.delete({ where: { id } });
  return item;
}

export type ContentOverview = {
  counts: Record<ContentKind, { published: number; draft: number }>;
  recent: ContentItem[];
};

export async function getContentOverview(): Promise<ContentOverview> {
  const prisma = getPrisma();
  const [groups, recentRows] = await Promise.all([
    prisma.contentItem.groupBy({ by: ['kind', 'published'], _count: { _all: true } }),
    prisma.contentItem.findMany({ orderBy: { updatedAt: 'desc' }, take: 5, include: withImages }),
  ]);

  const counts: ContentOverview['counts'] = {
    service: { published: 0, draft: 0 },
    material: { published: 0, draft: 0 },
    case: { published: 0, draft: 0 },
    banner: { published: 0, draft: 0 },
  };
  for (const group of groups) {
    counts[fromDbKind[group.kind]][group.published ? 'published' : 'draft'] = group._count._all;
  }
  return { counts, recent: recentRows.map(toItem) };
}
