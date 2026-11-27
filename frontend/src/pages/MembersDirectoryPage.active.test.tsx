import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_TOKEN_STORAGE_KEY, AuthProvider } from '../hooks/AuthContext';
import { MemberProfile } from '../types/member';
import { MembersDirectoryPage } from './MembersDirectoryPage';

const BASE_MEMBER: MemberProfile = {
  id: 'member-1',
  name: 'Gabriel Ferreira',
  email: 'gabriel@asciiej.com.br',
  avatarUrl: null,
  roleTitle: 'Desenvolvedor Fullstack',
  accessLevel: 'MEMBRO',
  department: 'PROJETOS',
  course: null,
  semester: null,
  squadName: 'Squad 2',
  skills: [],
  playbookProgress: 50,
  isActive: true,
};

const MOCK_MEMBERS: MemberProfile[] = [
  BASE_MEMBER,
  {
    ...BASE_MEMBER,
    id: 'member-2',
    name: 'Carlos Inativo',
    email: 'carlos@asciiej.com.br',
    isActive: false,
  },
];

describe('MembersDirectoryPage — membros ativos', () => {
  beforeEach(() => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'valid-jwt-token');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
        const url = String(input);

        if (url.endsWith('/auth/me')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              id: 'member-1',
              name: 'Gabriel Ferreira',
              email: 'gabriel@asciiej.com.br',
              roleTitle: 'Desenvolvedor Fullstack',
              systemRole: 'MEMBRO',
              department: 'PROJETOS',
              avatarUrl: null,
              isPresidencia: false,
              isDirector: false,
              canAccessFinance: false,
              isMember: true,
            }),
          };
        }

        if (url.endsWith('/members')) {
          return { ok: true, status: 200, json: async () => MOCK_MEMBERS };
        }

        return { ok: true, status: 200, json: async () => ({}) };
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('deve exibir apenas membros ativos na galeria', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <MembersDirectoryPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Gabriel Ferreira')).toBeInTheDocument();
    });

    expect(screen.queryByText('Carlos Inativo')).not.toBeInTheDocument();
  });
});
