import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../hooks/AuthContext';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('deve renderizar o formulário de login com campos de e-mail, senha e botão Entrar', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /ACESSO AO SISTEMA/i })).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail corporativo')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('deve exibir erro em danger quando as credenciais forem inválidas (401)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          statusCode: 401,
          message: 'Credenciais inválidas.',
          error: 'Unauthorized',
        }),
      }),
    );

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('E-mail corporativo'), {
      target: { value: 'membro@ascii.org.br' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'senha-errada' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Credenciais inválidas.');
    });
  });

  it('deve autenticar e redirecionar para /membros em caso de sucesso', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'jwt-token-valido',
          user: {
            id: 'uuid-1',
            name: 'Ana Clara',
            email: 'presidencia@ascii.org.br',
            roleTitle: 'Presidente',
            systemRole: 'PRESIDENCIA',
            department: 'PRESIDENCIA',
            avatarUrl: null,
          },
        }),
      }),
    );

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/membros" element={<div>Página de Membros</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('E-mail corporativo'), {
      target: { value: 'presidencia@ascii.org.br' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'Ascii@2026' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(screen.getByText('Página de Membros')).toBeInTheDocument();
    });
    expect(localStorage.getItem('ascii_erp_token')).toBe('jwt-token-valido');
  });
});
