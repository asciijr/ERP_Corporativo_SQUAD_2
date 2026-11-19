import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_TOKEN_STORAGE_KEY, AuthProvider } from '../hooks/AuthContext';
import { AuthMeResponse } from '../types/auth';
import { MemberProfile } from '../types/member';
import { MembersDirectoryPage } from './MembersDirectoryPage';

const MOCK_MEMBERS: MemberProfile[] = [
  {
    id: 'member-1',
    name: 'Gabriel Ferreira',
    email: 'gabriel@asciiej.com.br',
    ufuEmail: 'gabriel@ufu.br',
    avatarUrl: null,
    roleTitle: 'Desenvolvedor Fullstack',
    accessLevel: 'MEMBRO',
    department: 'PROJETOS',
    course: 'Bacharelado em Sistemas de Informação',
    semester: '4º Período',
    squadName: 'Squad 2',
    skills: ['TypeScript', 'React', 'NestJS'],
    birthDate: '2004-03-10',
    phone: '(34) 99999-1111',
    cpf: '11122233344',
    ufuRegistration: '12211BSI001',
    playbookProgress: 75,
    isActive: true,
  },
  {
    id: 'member-2',
    name: 'Mariana Oliveira',
    email: 'mariana@asciiej.com.br',
    ufuEmail: 'mariana@ufu.br',
    avatarUrl: null,
    roleTitle: 'Diretora de Projetos',
    accessLevel: 'DIRETOR',
    department: 'PROJETOS',
    course: 'Bacharelado em Ciência da Computação',
    semester: '6º Período',
    squadName: 'Squad 1',
    skills: ['Scrum', 'Arquitetura'],
    birthDate: '2002-08-22',
    phone: '(34) 99999-2222',
    cpf: '55566677788',
    ufuRegistration: '12011BCC009',
    playbookProgress: 100,
    isActive: true,
  },
];

function setupAuthenticatedDirectory(currentUser: AuthMeResponse) {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'valid-jwt-token');

  const fetchMock = vi
    .fn()
    .mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';

      if (url.endsWith('/auth/me') && method === 'GET') {
        return {
          ok: true,
          status: 200,
          json: async () => currentUser,
        };
      }

      if (url.endsWith('/members') && method === 'GET') {
        return {
          ok: true,
          status: 200,
          json: async () => MOCK_MEMBERS,
        };
      }

      if (url.includes('/members/') && method === 'PATCH') {
        const body = JSON.parse(init?.body as string) as Record<string, unknown>;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            ...MOCK_MEMBERS[0],
            ...body,
          }),
        };
      }

      return {
        ok: true,
        status: 200,
        json: async () => ({}),
      };
    });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('MembersDirectoryPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('deve listar membros, filtrar por nome/cargo na SearchBar e filtrar por Squad', async () => {
    setupAuthenticatedDirectory({
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
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <MembersDirectoryPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Gabriel Ferreira')).toBeInTheDocument();
      expect(screen.getByText('Mariana Oliveira')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText('Buscar membro por nome ou cargo');
    fireEvent.change(searchInput, { target: { value: 'Mariana' } });

    expect(screen.queryByText('Gabriel Ferreira')).not.toBeInTheDocument();
    expect(screen.getByText('Mariana Oliveira')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Limpar busca' }));
    expect(screen.getByText('Gabriel Ferreira')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Squad 2' }));
    expect(screen.getByText('Gabriel Ferreira')).toBeInTheDocument();
    expect(screen.queryByText('Mariana Oliveira')).not.toBeInTheDocument();
  });

  it('para MEMBRO comum: deve abrir MemberDetailModal com tags e barra de Playbook, sem exibir dados administrativos nem botão de gerenciar cargo', async () => {
    setupAuthenticatedDirectory({
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
    });

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

    fireEvent.click(screen.getByRole('button', { name: 'Ver detalhes de Gabriel Ferreira' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Progresso do Playbook' })).toHaveAttribute(
      'aria-valuenow',
      '75',
    );
    expect(screen.queryByTestId('member-admin-details')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Gerenciar Cargo / Editar' }),
    ).not.toBeInTheDocument();
  });

  it('para PRESIDENCIA: deve exibir dados administrativos completos, permitir editar cargo e nível de acesso via PATCH /members/:id e atualizar a galeria', async () => {
    const fetchMock = setupAuthenticatedDirectory({
      id: 'pres-1',
      name: 'Ana Carolina Souza',
      email: 'presidencia@asciiej.com.br',
      roleTitle: 'Presidente',
      systemRole: 'PRESIDENCIA',
      department: 'PRESIDENCIA',
      avatarUrl: null,
      isPresidencia: true,
      isDirector: true,
      canAccessFinance: true,
      isMember: false,
    });

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

    fireEvent.click(screen.getByRole('button', { name: 'Ver detalhes de Gabriel Ferreira' }));

    expect(screen.getByTestId('member-admin-details')).toBeInTheDocument();
    expect(screen.getByText('111.222.333-44')).toBeInTheDocument();
    expect(screen.getByText('12211BSI001')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Gerenciar Cargo / Editar' }));

    const roleSelect = screen.getByLabelText('Cargo na ASCII') as HTMLSelectElement;
    const accessLevelSelect = screen.getByLabelText('Nível de acesso no sistema');

    const roleOptionValues = Array.from(roleSelect.options).map((opt) => opt.value);
    expect(roleOptionValues).toEqual(['Diretor', 'Assessor', 'Trainee']);

    fireEvent.change(roleSelect, { target: { value: 'Assessor' } });
    fireEvent.change(accessLevelSelect, { target: { value: 'DIRETOR' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() => {
      expect(screen.getByText('Assessor')).toBeInTheDocument();
    });

    const patchCall = fetchMock.mock.calls.find(
      (call) => String(call[0]).includes('/members/member-1') && call[1]?.method === 'PATCH',
    );
    expect(patchCall).toBeDefined();
    const sentBody = JSON.parse(patchCall?.[1]?.body as string) as Record<string, unknown>;
    expect(sentBody.roleTitle).toBe('Assessor');
    expect(sentBody.accessLevel).toBe('DIRETOR');
  });
});
