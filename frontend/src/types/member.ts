import { AccessLevel } from './auth';

export type UndergraduateCourse =
  'Bacharelado em Ciência da Computação' | 'Bacharelado em Sistemas de Informação';

export const UNDERGRADUATE_COURSES: readonly UndergraduateCourse[] = [
  'Bacharelado em Ciência da Computação',
  'Bacharelado em Sistemas de Informação',
];

export type AsciiRoleTitle = 'Diretor' | 'Assessor' | 'Trainee';

export const ASCII_ROLE_TITLES: readonly AsciiRoleTitle[] = ['Diretor', 'Assessor', 'Trainee'];

export const UNDERGRADUATE_SEMESTERS: readonly string[] = [
  '1º Período',
  '2º Período',
  '3º Período',
  '4º Período',
  '5º Período',
  '6º Período',
  '7º Período',
  '8º Período',
  '9º Período',
  '10º Período',
];

export const ASCII_DEPARTMENTS: readonly string[] = [
  'FINANCEIRO',
  'PROJETOS',
  'COMERCIAL',
  'MARKETING',
  'GESTAO_DE_PESSOAS',
  'A DEFINIR',
];

export interface MemberChecklistSummary {
  id?: string;
  completed: boolean;
}

export interface MemberProfile {
  id: string;
  name: string;
  email: string;
  ufuEmail?: string | null;
  avatarUrl: string | null;
  roleTitle: string;
  accessLevel: AccessLevel;
  systemRole?: AccessLevel;
  department: string;
  course: string | null;
  semester: string | null;
  squadName: string | null;
  skills: string[];
  birthDate?: string | null;
  phone?: string | null;
  cpf?: string | null;
  ufuRegistration?: string | null;
  playbookProgress?: number;
  checklists?: MemberChecklistSummary[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateOwnProfilePayload {
  name: string;
  avatarUrl?: string | null;
  phone?: string;
  course?: string;
  semester?: string;
  skills?: string[];
}

export interface UpdateMemberRolePayload {
  roleTitle: string;
  department: string;
  squadName?: string | null;
  isActive: boolean;
  accessLevel?: AccessLevel;
}
