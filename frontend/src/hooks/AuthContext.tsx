/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authService } from '../services/authService';
import {
  AuthenticatedUser,
  AuthContextValue,
  AuthMeResponse,
  LoginCredentials,
  RegisterCredentials,
} from '../types/auth';

export const AUTH_TOKEN_STORAGE_KEY = 'ascii_erp_token';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface PermissionFlags {
  isPresidencia: boolean;
  isDirector: boolean;
  canAccessFinance: boolean;
  isMember: boolean;
}

function computePermissions(user: AuthenticatedUser | AuthMeResponse | null): PermissionFlags {
  if (!user) {
    return {
      isPresidencia: false,
      isDirector: false,
      canAccessFinance: false,
      isMember: false,
    };
  }

  const effectiveRole = user.systemRole ?? user.accessLevel ?? 'MEMBRO';

  const isPresidencia =
    'isPresidencia' in user ? user.isPresidencia : effectiveRole === 'PRESIDENCIA';

  const isDirector =
    'isDirector' in user
      ? user.isDirector
      : effectiveRole === 'PRESIDENCIA' || effectiveRole === 'DIRETOR';

  const canAccessFinance =
    'canAccessFinance' in user
      ? user.canAccessFinance
      : effectiveRole === 'PRESIDENCIA' ||
        (effectiveRole === 'DIRETOR' && user.department === 'FINANCEIRO');

  const isMember = 'isMember' in user ? user.isMember : effectiveRole === 'MEMBRO';

  return {
    isPresidencia,
    isDirector,
    canAccessFinance,
    isMember,
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(AUTH_TOKEN_STORAGE_KEY),
  );
  const [user, setUser] = useState<AuthenticatedUser | AuthMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() =>
    Boolean(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)),
  );

  const clearSession = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    authService
      .getMe(storedToken)
      .then((meResponse) => {
        if (isMounted) {
          setToken(storedToken);
          setUser(meResponse);
        }
      })
      .catch(() => {
        if (isMounted) {
          clearSession();
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [clearSession]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.accessToken);
    setToken(response.accessToken);
    setUser(response.user);
  }, []);

  const register = useCallback(async (payload: RegisterCredentials) => {
    const response = await authService.register(payload);
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.accessToken);
    setToken(response.accessToken);
    setUser(response.user);
  }, []);

  const updateUser = useCallback((partialUser: Partial<AuthenticatedUser>) => {
    setUser((previous) => {
      if (!previous) {
        return previous;
      }
      const nextRole =
        partialUser.systemRole ??
        partialUser.accessLevel ??
        previous.systemRole ??
        previous.accessLevel ??
        'MEMBRO';
      return {
        ...previous,
        ...partialUser,
        systemRole: nextRole,
        accessLevel: nextRole,
      };
    });
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const permissions = useMemo(() => computePermissions(user), [user]);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      register,
      updateUser,
      logout,
      ...permissions,
    }),
    [user, token, isLoading, login, register, updateUser, logout, permissions],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider.');
  }
  return context;
}
