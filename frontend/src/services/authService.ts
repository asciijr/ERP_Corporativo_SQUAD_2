import {
  AccessLevel,
  ApiErrorEnvelope,
  AuthenticatedUser,
  AuthMeResponse,
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
} from '../types/auth';

const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

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
    // Caso a resposta não possua JSON válido, usa mensagem padrão pelo status HTTP
  }

  if (response.status === 409) {
    return 'E-mail, CPF ou matrícula UFU já estão cadastrados no sistema.';
  }
  if (response.status === 401) {
    return 'Credenciais inválidas ou sessão expirada.';
  }
  if (response.status === 403) {
    return 'Acesso negado para este perfil.';
  }
  if (response.status === 400) {
    return 'Dados inválidos. Verifique os campos informados.';
  }

  return fallbackMessage;
}

function normalizeUserObject(
  raw: Record<string, unknown>,
  fallbackEmail = '',
  fallbackName = 'Membro ASCII',
): AuthenticatedUser {
  const resolvedRole = ((raw.systemRole as AccessLevel | undefined) ??
    (raw.accessLevel as AccessLevel | undefined) ??
    'MEMBRO') as AccessLevel;

  return {
    id: typeof raw.id === 'string' ? raw.id : 'member-id',
    name: typeof raw.name === 'string' ? raw.name : fallbackName,
    email: typeof raw.email === 'string' ? raw.email : fallbackEmail,
    ufuEmail: typeof raw.ufuEmail === 'string' ? raw.ufuEmail : null,
    roleTitle: typeof raw.roleTitle === 'string' ? raw.roleTitle : 'Membro',
    systemRole: resolvedRole,
    accessLevel: resolvedRole,
    department: typeof raw.department === 'string' ? raw.department : 'A DEFINIR',
    avatarUrl: typeof raw.avatarUrl === 'string' ? raw.avatarUrl : null,
    course: typeof raw.course === 'string' ? raw.course : null,
    semester: typeof raw.semester === 'string' ? raw.semester : null,
    squadName: typeof raw.squadName === 'string' ? raw.squadName : null,
    skills: Array.isArray(raw.skills)
      ? raw.skills.filter((item): item is string => typeof item === 'string')
      : [],
    birthDate: typeof raw.birthDate === 'string' ? raw.birthDate : null,
    phone: typeof raw.phone === 'string' ? raw.phone : null,
    cpf: typeof raw.cpf === 'string' ? raw.cpf : null,
    ufuRegistration: typeof raw.ufuRegistration === 'string' ? raw.ufuRegistration : null,
    isActive: typeof raw.isActive === 'boolean' ? raw.isActive : true,
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    let response: Response;
    try {
      response = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
    } catch {
      throw new Error('Não foi possível conectar ao servidor da ASCII. Tente novamente.');
    }

    if (!response.ok) {
      const message = await extractErrorMessage(
        response,
        'Falha ao realizar autenticação. Verifique suas credenciais.',
      );
      throw new Error(message);
    }

    const body = (await response.json()) as Record<string, unknown>;
    const rawUser =
      body.user && typeof body.user === 'object' ? (body.user as Record<string, unknown>) : body;

    return {
      accessToken: typeof body.accessToken === 'string' ? body.accessToken : '',
      user: normalizeUserObject(rawUser, credentials.email),
    };
  },

  async register(payload: RegisterCredentials): Promise<LoginResponse> {
    let response: Response;
    try {
      response = await fetch(`${getApiBaseUrl()}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error('Não foi possível conectar ao servidor da ASCII. Tente novamente.');
    }

    if (!response.ok) {
      const message = await extractErrorMessage(
        response,
        'Não foi possível concluir o cadastro corporativo.',
      );
      throw new Error(message);
    }

    const body = (await response.json()) as Record<string, unknown>;
    const rawUser =
      body.user && typeof body.user === 'object'
        ? (body.user as Record<string, unknown>)
        : body.member && typeof body.member === 'object'
          ? (body.member as Record<string, unknown>)
          : body;

    const normalizedUser = normalizeUserObject(
      {
        ...payload,
        ...rawUser,
      },
      payload.email,
      payload.name,
    );

    const accessToken =
      typeof body.accessToken === 'string' && body.accessToken.length > 0
        ? body.accessToken
        : 'registered-session-token';

    return {
      accessToken,
      user: normalizedUser,
    };
  },

  async getMe(token: string): Promise<AuthMeResponse> {
    let response: Response;
    try {
      response = await fetch(`${getApiBaseUrl()}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      throw new Error('Não foi possível validar a sessão no servidor.');
    }

    if (!response.ok) {
      const message = await extractErrorMessage(
        response,
        'Sessão inválida ou expirada. Faça login novamente.',
      );
      throw new Error(message);
    }

    const body = (await response.json()) as Record<string, unknown>;
    const normalized = normalizeUserObject(body);
    const isPresidencia =
      typeof body.isPresidencia === 'boolean'
        ? body.isPresidencia
        : normalized.systemRole === 'PRESIDENCIA';
    const isDirector =
      typeof body.isDirector === 'boolean'
        ? body.isDirector
        : normalized.systemRole === 'PRESIDENCIA' || normalized.systemRole === 'DIRETOR';
    const canAccessFinance =
      typeof body.canAccessFinance === 'boolean'
        ? body.canAccessFinance
        : normalized.systemRole === 'PRESIDENCIA' ||
          (normalized.systemRole === 'DIRETOR' && normalized.department === 'FINANCEIRO');
    const isMember =
      typeof body.isMember === 'boolean' ? body.isMember : normalized.systemRole === 'MEMBRO';

    return {
      ...normalized,
      isPresidencia,
      isDirector,
      canAccessFinance,
      isMember,
    };
  },
};
