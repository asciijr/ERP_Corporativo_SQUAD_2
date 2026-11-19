import { ApiErrorEnvelope, AuthMeResponse, LoginCredentials, LoginResponse } from '../types/auth';

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

  if (response.status === 401) {
    return 'Credenciais inválidas ou sessão expirada.';
  }
  if (response.status === 403) {
    return 'Acesso negado para este perfil.';
  }
  if (response.status === 400) {
    return 'Dados de autenticação inválidos.';
  }

  return fallbackMessage;
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

    return (await response.json()) as LoginResponse;
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

    return (await response.json()) as AuthMeResponse;
  },
};
