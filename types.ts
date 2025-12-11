export enum DocumentCategory {
  OPERATIONAL = 'Operacional',
  HEALTH_SAFETY = 'Saúde e Segurança',
  QUALITY = 'Qualidade',
  REGULATORY = 'Regulatório',
  CONTRACTS = 'Contratos',
  FLEET = 'Frota',
}

export enum DocumentStatus {
  ACTIVE = 'Ativo',
  EXPIRING = 'A vencer',
  EXPIRED = 'Vencido',
}

export interface Location {
  id: string;
  name: string;
  address?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  description: string;
  category: DocumentCategory;
  locationId: string;
  issueDate: string; // ISO Date string
  expiryDate?: string; // ISO Date string
  responsible: string;
  code?: string;
  observations?: string;
  fileName?: string;
  createdAt: number;
}

export interface FilterState {
  category: string;
  locationId: string;
  status: string;
  search: string;
}
