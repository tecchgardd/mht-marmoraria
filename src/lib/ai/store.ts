import type { Briefing, Project, ProjectImage, ProjectVersion, SpecialistLead } from './types';

const projects = new Map<string, Project>();
const versions = new Map<string, ProjectVersion[]>();
const leads = new Map<string, SpecialistLead>();

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function now() {
  return new Date().toISOString();
}

export function createOrUpdateProject(projectId: string | undefined, briefing: Briefing) {
  const currentTime = now();
  const id = projectId || createId('project');
  const existing = projects.get(id);

  const project: Project = {
    id,
    status: existing?.status || 'DRAFT',
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
    createdAt: existing?.createdAt || currentTime,
    updatedAt: currentTime,
    customerName: existing?.customerName,
    customerWhatsapp: existing?.customerWhatsapp,
    userId: existing?.userId,
  };

  projects.set(id, project);
  return project;
}

export function getProject(projectId: string) {
  return projects.get(projectId);
}

export function getVersions(projectId: string) {
  return versions.get(projectId) || [];
}

export function addProjectVersion(input: {
  projectId: string;
  userRequest: string;
  briefingJson: Briefing;
  imagePrompt: string;
  negativePrompt: string;
  imagesJson: ProjectImage[];
}) {
  const projectVersions = getVersions(input.projectId);
  const version: ProjectVersion = {
    id: createId('version'),
    projectId: input.projectId,
    versionNumber: projectVersions.length + 1,
    userRequest: input.userRequest,
    briefingJson: input.briefingJson,
    imagePrompt: input.imagePrompt,
    negativePrompt: input.negativePrompt,
    imagesJson: input.imagesJson.map((image) => ({ ...image, projectVersionId: '' })),
    createdAt: now(),
  };

  version.imagesJson = input.imagesJson.map((image) => ({
    ...image,
    projectVersionId: version.id,
  }));

  versions.set(input.projectId, [...projectVersions, version]);
  return version;
}

export function createProjectImage(input: Omit<ProjectImage, 'id' | 'createdAt' | 'projectVersionId'>) {
  return {
    id: createId('image'),
    projectVersionId: '',
    createdAt: now(),
    ...input,
  };
}

export function createLead(projectId: string, input: Omit<SpecialistLead, 'id' | 'projectId' | 'status' | 'createdAt'>) {
  const lead: SpecialistLead = {
    id: createId('lead'),
    projectId,
    customerName: input.customerName,
    customerWhatsapp: input.customerWhatsapp,
    message: input.message,
    status: 'NEW',
    createdAt: now(),
  };

  leads.set(lead.id, lead);
  const project = projects.get(projectId);
  if (project) {
    projects.set(projectId, {
      ...project,
      customerName: input.customerName,
      customerWhatsapp: input.customerWhatsapp,
      status: 'SENT_TO_SPECIALIST',
      updatedAt: now(),
    });
  }
  return lead;
}
