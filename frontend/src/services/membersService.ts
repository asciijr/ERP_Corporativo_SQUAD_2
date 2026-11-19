import { AccessLevel, ApiErrorEnvelope } from '../types/auth';
import {
  MemberChecklistSummary,
  MemberProfile,
  UpdateMemberRolePayload,
  UpdateOwnProfilePayload,
} from '../types/member';

const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

export function formatPhoneMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) {
    return '';
  }
  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function formatCpfMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

async function extractErrorMessage(response: Response, fallbackMessage: string): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorEnvelope;
    if (Array.isArray(body.message) && body.message.length > 0) {
      return body.message.join(' ');
    }
    if (typeof body.message === 'string' && body.message.trim().length > 0) {
      return body.message;
    }
  } catch {
    // Usa mensagem de fallback
  }

  if (response.status === 403) {
    return 'Você não possui permissão para realizar esta operação.';
  }
  if (response.status === 404) {
    return 'Membro não encontrado no diretório.';
  }

  return fallbackMessage;
}

function computePlaybookProgress(raw: Record<string, unknown>): number {
  if (typeof raw.playbookProgress === 'number' && Number.isFinite(raw.playbookProgress)) {
    return Math.min(100, Math.max(0, Math.round(raw.playbookProgress)));
  }

  if (Array.isArray(raw.checklists) && raw.checklists.length > 0) {
    const checklists = raw.checklists as MemberChecklistSummary[];
    const completedCount = checklists.filter((item) => Boolean(item?.completed)).length;
    return Math.round((completedCount / checklists.length) * 100);
  }

  return 0;
}

export function normalizeMemberProfile(raw: Record<string, unknown>): MemberProfile {
  const accessLevel = ((raw.accessLevel as AccessLevel | undefined) ??
    (raw.systemRole as AccessLevel | undefined) ??
    'MEMBRO') as AccessLevel;

  return {
    id: typeof raw.id === 'string' ? raw.id : '',
    name: typeof raw.name === 'string' ? raw.name : 'Membro ASCII',
    email: typeof raw.email === 'string' ? raw.email : '',
    ufuEmail: typeof raw.ufuEmail === 'string' ? raw.ufuEmail : null,
    avatarUrl: typeof raw.avatarUrl === 'string' ? raw.avatarUrl : null,
    roleTitle: typeof raw.roleTitle === 'string' ? raw.roleTitle : 'Membro',
    accessLevel,
    systemRole: accessLevel,
    department: typeof raw.department === 'string' ? raw.department : 'A DEFINIR',
    course: typeof raw.course === 'string' ? raw.course : null,
    semester: typeof raw.semester === 'string' ? raw.semester : null,
    squadName: typeof raw.squadName === 'string' ? raw.squadName : null,
    skills: Array.isArray(raw.skills)
      ? raw.skills.filter((skill): skill is string => typeof skill === 'string')
      : [],
    birthDate: typeof raw.birthDate === 'string' ? raw.birthDate : null,
    phone: typeof raw.phone === 'string' ? raw.phone : null,
    cpf: typeof raw.cpf === 'string' ? raw.cpf : null,
    ufuRegistration: typeof raw.ufuRegistration === 'string' ? raw.ufuRegistration : null,
    playbookProgress: computePlaybookProgress(raw),
    isActive: typeof raw.isActive === 'boolean' ? raw.isActive : true,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
  };
}

export const membersService = {
  async listMembers(token: string): Promise<MemberProfile[]> {
    let response: Response;
    try {
      response = await fetch(`${getApiBaseUrl()}/members`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      throw new Error('Não foi possível carregar o diretório de membros.');
    }

    if (!response.ok) {
      const message = await extractErrorMessage(
        response,
        'Falha ao consultar a lista de membros da ASCII.',
      );
      throw new Error(message);
    }

    const body = (await response.json()) as unknown;
    if (Array.isArray(body)) {
      return body.map((item) => normalizeMemberProfile(item as Record<string, unknown>));
    }

    if (body && typeof body === 'object' && Array.isArray((body as { data?: unknown }).data)) {
      return (body as { data: Record<string, unknown>[] }).data.map(normalizeMemberProfile);
    }

    return [];
  },

  async getMyProfile(token: string): Promise<MemberProfile> {
    let response: Response;
    try {
      response = await fetch(`${getApiBaseUrl()}/members/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      throw new Error('Não foi possível carregar os dados completos do seu perfil.');
    }

    if (!response.ok) {
      const message = await extractErrorMessage(response, 'Falha ao carregar dados do perfil.');
      throw new Error(message);
    }

    const body = (await response.json()) as Record<string, unknown>;
    return normalizeMemberProfile(body);
  },

  async getMemberById(token: string, memberId: string): Promise<MemberProfile> {
    let response: Response;
    try {
      response = await fetch(`${getApiBaseUrl()}/members/${memberId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      throw new Error('Não foi possível carregar os detalhes do membro.');
    }

    if (!response.ok) {
      const message = await extractErrorMessage(response, 'Falha ao carregar detalhes do membro.');
      throw new Error(message);
    }

    const body = (await response.json()) as Record<string, unknown>;
    return normalizeMemberProfile(body);
  },

  async updateMyProfile(token: string, payload: UpdateOwnProfilePayload): Promise<MemberProfile> {
    let response: Response;
    try {
      response = await fetch(`${getApiBaseUrl()}/members/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error('Não foi possível salvar as alterações do perfil.');
    }

    if (!response.ok) {
      const message = await extractErrorMessage(response, 'Falha ao atualizar o seu perfil.');
      throw new Error(message);
    }

    const body = (await response.json()) as Record<string, unknown>;
    return normalizeMemberProfile(body);
  },

  async updateMemberRole(
    token: string,
    memberId: string,
    payload: UpdateMemberRolePayload,
  ): Promise<MemberProfile> {
    let response: Response;
    try {
      response = await fetch(`${getApiBaseUrl()}/members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error('Não foi possível atualizar o cargo do membro.');
    }

    if (!response.ok) {
      const message = await extractErrorMessage(
        response,
        'Falha ao atualizar atribuições do membro.',
      );
      throw new Error(message);
    }

    const body = (await response.json()) as Record<string, unknown>;
    return normalizeMemberProfile(body);
  },
};
