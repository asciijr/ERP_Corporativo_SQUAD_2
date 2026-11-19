export type AccessLevel = 'PRESIDENCIA' | 'DIRETOR' | 'MEMBRO';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  ufuEmail?: string | null;
  roleTitle: string;
  systemRole: AccessLevel;
  accessLevel?: AccessLevel;
  department: string;
  avatarUrl: string | null;
  course?: string | null;
  semester?: string | null;
  squadName?: string | null;
  skills?: string[];
  birthDate?: string | null;
  phone?: string | null;
  cpf?: string | null;
  ufuRegistration?: string | null;
  isActive?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  ufuEmail: string;
  password: string;
  birthDate: string;
  phone: string;
  cpf: string;
  ufuRegistration: string;
  course: string;
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
  register: (payload: RegisterCredentials) => Promise<void>;
  updateUser: (partialUser: Partial<AuthenticatedUser>) => void;
  logout: () => void;
  isPresidencia: boolean;
  isDirector: boolean;
  canAccessFinance: boolean;
  isMember: boolean;
}
