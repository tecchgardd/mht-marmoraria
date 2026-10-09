import type {
  Project as ProjectRow,
  ProjectImage as ProjectImageRow,
  ProjectVersion as ProjectVersionRow,
  SpecialistLead as SpecialistLeadRow,
} from '../../generated/prisma/client';
import { getPrisma, isPrismaError, isUuid } from '../prisma';
import type { Briefing, Project, ProjectImage, ProjectImageType, ProjectVersion, SpecialistLead } from './types';

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    status: row.status,
    customerName: row.customerName ?? undefined,
    customerWhatsapp: row.customerWhatsapp ?? undefined,
    environmentType: row.environmentType,
    style: row.style,
    stoneType: row.stoneType,
    furnitureColors: row.furnitureColors,
    countertopType: row.countertopType,
    sinkType: row.sinkType,
    lighting: row.lighting,
    approximateMeasures: row.approximateMeasures,
    references: row.references,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toImage(row: ProjectImageRow): ProjectImage {
  return {
    id: row.id,
    projectVersionId: row.versionId,
    type: row.type,
    imageUrl: row.imageUrl,
    prompt: row.prompt,
    createdAt: row.createdAt.toISOString(),
  };
}

function toVersion(row: ProjectVersionRow & { images: ProjectImageRow[] }): ProjectVersion {
  return {
    id: row.id,
    projectId: row.projectId,
    versionNumber: row.versionNumber,
    userRequest: row.userRequest,
    briefingJson: row.briefing as Briefing,
    imagePrompt: row.imagePrompt,
    negativePrompt: row.negativePrompt,
    imagesJson: row.images.map(toImage),
    createdAt: row.createdAt.toISOString(),
  };
}

function toLead(row: SpecialistLeadRow): SpecialistLead {
  return {
    id: row.id,
    projectId: row.projectId,
    customerName: row.customerName,
    customerWhatsapp: row.customerWhatsapp,
    message: row.message,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

function briefingColumns(briefing: Briefing) {
  return {
    environmentType: briefing.ambiente,
    style: briefing.estilo,
    stoneType: briefing.pedra,
    furnitureColors: briefing.coresMoveis,
    countertopType: briefing.bancada,
    sinkType: briefing.pia,
    lighting: briefing.iluminacao,
    approximateMeasures: briefing.medidasAproximadas,
    references: briefing.referencias,
    notes: briefing.observacoes,
  };
}

export function projectToBriefing(project: Project): Briefing {
  return {
    ambiente: project.environmentType,
    estilo: project.style,
    pedra: project.stoneType,
    coresMoveis: project.furnitureColors,
    bancada: project.countertopType,
    pia: project.sinkType,
    iluminacao: project.lighting,
    medidasAproximadas: project.approximateMeasures,
    referencias: project.references,
    observacoes: project.notes,
  };
}

// Unknown or invalid ids (e.g. a stale id kept by the browser) start a new project.
export async function createOrUpdateProject(projectId: string | undefined, briefing: Briefing) {
  const prisma = getPrisma();
  const data = briefingColumns(briefing);

  if (isUuid(projectId)) {
    try {
      return toProject(await prisma.project.update({ where: { id: projectId }, data }));
    } catch (error) {
      if (!isPrismaError(error, 'P2025')) throw error;
    }
  }
  return toProject(await prisma.project.create({ data }));
}

export async function getProject(projectId: string) {
  if (!isUuid(projectId)) return null;
  const row = await getPrisma().project.findUnique({ where: { id: projectId } });
  return row ? toProject(row) : null;
}

export async function getLatestVersion(projectId: string) {
  if (!isUuid(projectId)) return null;
  const row = await getPrisma().projectVersion.findFirst({
    where: { projectId },
    orderBy: { versionNumber: 'desc' },
    include: { images: { orderBy: { createdAt: 'asc' } } },
  });
  return row ? toVersion(row) : null;
}

export async function addProjectVersion(input: {
  projectId: string;
  userRequest: string;
  briefing: Briefing;
  imagePrompt: string;
  negativePrompt: string;
  images: Array<{ type: ProjectImageType; imageUrl: string; prompt: string }>;
}) {
  const prisma = getPrisma();
  const row = await prisma.$transaction(async (tx) => {
    const last = await tx.projectVersion.findFirst({
      where: { projectId: input.projectId },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true },
    });
    return tx.projectVersion.create({
      data: {
        projectId: input.projectId,
        versionNumber: (last?.versionNumber ?? 0) + 1,
        userRequest: input.userRequest,
        briefing: input.briefing,
        imagePrompt: input.imagePrompt,
        negativePrompt: input.negativePrompt,
        images: { create: input.images },
      },
      include: { images: { orderBy: { createdAt: 'asc' } } },
    });
  });
  return toVersion(row);
}

export async function createLead(
  projectId: string,
  input: Pick<SpecialistLead, 'customerName' | 'customerWhatsapp' | 'message'>,
) {
  const prisma = getPrisma();
  const [lead] = await prisma.$transaction([
    prisma.specialistLead.create({ data: { projectId, ...input } }),
    prisma.project.update({
      where: { id: projectId },
      data: {
        customerName: input.customerName,
        customerWhatsapp: input.customerWhatsapp,
        status: 'SENT_TO_SPECIALIST',
      },
    }),
  ]);
  return toLead(lead);
}

export type LeadSummary = SpecialistLead & { environment: string; stone: string };

export async function getLeadsOverview() {
  const prisma = getPrisma();
  const [newCount, total, projects, recent] = await Promise.all([
    prisma.specialistLead.count({ where: { status: 'NEW' } }),
    prisma.specialistLead.count(),
    prisma.project.count(),
    prisma.specialistLead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { project: { select: { environmentType: true, stoneType: true } } },
    }),
  ]);

  return {
    newCount,
    total,
    projects,
    recent: recent.map(({ project, ...lead }): LeadSummary => ({
      ...toLead(lead),
      environment: project.environmentType,
      stone: project.stoneType,
    })),
  };
}
