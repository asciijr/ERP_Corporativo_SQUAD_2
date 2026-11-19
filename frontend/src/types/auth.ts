export type AccessLevel = 'PRESIDENCIA' | 'DIRETOR' | 'MEMBRO';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  roleTitle: string;
  systemRole: AccessLevel;
  department: string;
  avatarUrl: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthenticatedUser;
}

export interface AuthMeResponse extends AuthenticatedUser {
  isPresidencia: boolean;
  isDirector: boolean;
  canAccessFinance: boolean;
  isMember: boolean;
}

export interface ApiErrorEnvelope {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

export interface AuthContextValue {
  user: AuthenticatedUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isPresidencia: boolean;
  isDirector: boolean;
  canAccessFinance: boolean;
  isMember: boolean;
}
