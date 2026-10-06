export type ProjectStatus = 'DRAFT' | 'IN_REVIEW' | 'SENT_TO_SPECIALIST';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'CLOSED' | 'LOST';

export type Briefing = {
  ambiente: string;
  estilo: string;
  pedra: string;
  coresMoveis: string;
  bancada: string;
  pia: string;
  iluminacao: string;
  medidasAproximadas: string;
  referencias: string;
  observacoes: string;
};

export type Project = {
  id: string;
  userId?: string;
  customerName?: string;
  customerWhatsapp?: string;
  status: ProjectStatus;
  environmentType: string;
  style: string;
  stoneType: string;
  furnitureColors: string;
  countertopType: string;
  sinkType: string;
  lighting: string;
  approximateMeasures: string;
  references: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectImageType =
  | 'FRONT'
  | 'LEFT'
  | 'RIGHT'
  | 'TOP'
  | 'COUNTERTOP_DETAIL'
  | 'SINK_DETAIL'
  | 'FINISH_DETAIL';

export type ProjectImage = {
  id: string;
  projectVersionId: string;
  type: ProjectImageType;
  imageUrl: string;
  prompt: string;
  createdAt: string;
};

export type ProjectVersion = {
  id: string;
  projectId: string;
  versionNumber: number;
  userRequest: string;
  briefingJson: Briefing;
  imagePrompt: string;
  negativePrompt: string;
  imagesJson: ProjectImage[];
  createdAt: string;
};

export type SpecialistLead = {
  id: string;
  projectId: string;
  customerName: string;
  customerWhatsapp: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
};
