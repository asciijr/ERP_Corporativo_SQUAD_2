import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App, { AppRoutes } from './App';
import { AUTH_TOKEN_STORAGE_KEY, AuthProvider } from './hooks/AuthContext';
import { AuthMeResponse } from './types/auth';

function mockAuthMe(profile: AuthMeResponse) {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'valid-jwt-token');
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => profile,
    }),
  );
}

describe('App — Roteamento, Perfil e Controle de Acesso (3 Níveis)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('deve redirecionar utilizador não autenticado para a tela de login', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /ACESSO AO SISTEMA/i })).toBeInTheDocument();
    });
  });

  it('Nível MEMBRO: deve ver apenas Membros, Google Drive e Playbook/OKRs e ser redirecionado ao tentar acessar /financeiro ou /auditoria', async () => {
    mockAuthMe({
      id: 'uuid-membro',
      name: 'Lucas Ferreira',
      email: 'membro@ascii.org.br',
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
      <MemoryRouter initialEntries={['/financeiro']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /DIRETÓRIO DE MEMBROS/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: 'Membros' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Google Drive' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Playbook e OKRs' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Fluxo de Caixa' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Logs de Auditoria' })).not.toBeInTheDocument();
  });

  it('Nível DIRETOR (não-financeiro): deve acessar /auditoria, mas ser redirecionado para /membros ao tentar acessar /financeiro', async () => {
    mockAuthMe({
      id: 'uuid-dir-proj',
      name: 'Gabriel Souza',
      email: 'diretor.projetos@ascii.org.br',
      roleTitle: 'Diretor de Projetos',
      systemRole: 'DIRETOR',
      department: 'PROJETOS',
      avatarUrl: null,
      isPresidencia: false,
      isDirector: true,
      canAccessFinance: false,
      isMember: false,
    });

    render(
      <MemoryRouter initialEntries={['/auditoria']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /LOGS DE AUDITORIA/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: 'Logs de Auditoria' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Fluxo de Caixa' })).not.toBeInTheDocument();
  });

  it('Nível PRESIDENCIA / DIRETOR FINANCEIRO: deve exibir todos os itens na Sidebar e permitir acesso a /financeiro e /auditoria', async () => {
    mockAuthMe({
      id: 'uuid-pres',
      name: 'Ana Clara',
      email: 'presidencia@ascii.org.br',
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
      <MemoryRouter initialEntries={['/financeiro']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /FLUXO DE CAIXA/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: 'Membros' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Google Drive' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Playbook e OKRs' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Fluxo de Caixa' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Logs de Auditoria' })).toBeInTheDocument();
  });

  it('deve navegar para /perfil ao clicar em Editar perfil no dropdown do Header e encerrar sessão ao clicar em Sair', async () => {
    mockAuthMe({
      id: 'uuid-pres',
      name: 'Ana Clara',
      email: 'presidencia@ascii.org.br',
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
      <MemoryRouter initialEntries={['/membros']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /DIRETÓRIO DE MEMBROS/i })).toBeInTheDocument();
    });

    const profileTrigger = screen.getByRole('button', {
      name: /Menu de perfil de Ana Clara/i,
    });
    fireEvent.click(profileTrigger);

    const editProfileItem = screen.getByRole('menuitem', {
      name: 'Editar perfil',
    });
    fireEvent.click(editProfileItem);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /MEU PERFIL/i })).toBeInTheDocument();
    });
    expect(screen.getAllByText('presidencia@ascii.org.br').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Menu de perfil de Ana Clara/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Sair' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /ACESSO AO SISTEMA/i })).toBeInTheDocument();
    });
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });
});
