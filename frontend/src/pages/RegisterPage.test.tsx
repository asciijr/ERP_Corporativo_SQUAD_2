import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../hooks/AuthContext';
import { RegisterPage } from './RegisterPage';

describe('RegisterPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('deve renderizar todos os campos obrigatórios e o dropdown de curso com exatamente as duas opções da FACOM/UFU', () => {
    render(
      <MemoryRouter initialEntries={['/cadastro']}>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /CADASTRO CORPORATIVO/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome completo')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail corporativo')).toHaveAttribute(
      'placeholder',
      'luis.melo@asciiej.com.br',
    );
    expect(screen.getByLabelText('E-mail institucional da UFU')).toHaveAttribute(
      'placeholder',
      'nome@ufu.br',
    );
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmação de senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Data de aniversário')).toHaveAttribute('type', 'date');
    expect(screen.getByLabelText('Telefone')).toHaveAttribute('placeholder', '(34) 99999-9999');
    expect(screen.getByLabelText('CPF')).toHaveAttribute('placeholder', '000.000.000-00');
    expect(screen.getByLabelText('Matrícula UFU')).toBeInTheDocument();

    const courseSelect = screen.getByLabelText('Curso de graduação') as HTMLSelectElement;
    const selectableOptions = Array.from(courseSelect.options).filter((opt) => !opt.disabled);

    expect(selectableOptions).toHaveLength(2);
    expect(selectableOptions[0].value).toBe('Bacharelado em Ciência da Computação');
    expect(selectableOptions[1].value).toBe('Bacharelado em Sistemas de Informação');
  });

  it('deve validar campos obrigatórios e sufixos de e-mail (@asciiej.com.br e @ufu.br)', async () => {
    render(
      <MemoryRouter initialEntries={['/cadastro']}>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Criar conta corporativa' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/Preencha todos os campos obrigatórios/i);

    fireEvent.change(screen.getByLabelText('Nome completo'), {
      target: { value: 'Luís Fellipe Pereira Melo' },
    });
    fireEvent.change(screen.getByLabelText('E-mail corporativo'), {
      target: { value: 'luis.melo@gmail.com' },
    });
    fireEvent.change(screen.getByLabelText('E-mail institucional da UFU'), {
      target: { value: 'luis.melo@ufu.br' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'Ascii@2026' },
    });
    fireEvent.change(screen.getByLabelText('Confirmação de senha'), {
      target: { value: 'Ascii@2026' },
    });
    fireEvent.change(screen.getByLabelText('Data de aniversário'), {
      target: { value: '2003-05-14' },
    });
    fireEvent.change(screen.getByLabelText('Telefone'), {
      target: { value: '34999998888' },
    });
    fireEvent.change(screen.getByLabelText('CPF'), {
      target: { value: '12345678901' },
    });
    fireEvent.change(screen.getByLabelText('Matrícula UFU'), {
      target: { value: '12111BCC001' },
    });
    fireEvent.change(screen.getByLabelText('Curso de graduação'), {
      target: { value: 'Bacharelado em Ciência da Computação' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Criar conta corporativa' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/@asciiej\.com\.br/i);

    fireEvent.change(screen.getByLabelText('E-mail corporativo'), {
      target: { value: 'luis.melo@asciiej.com.br' },
    });
    fireEvent.change(screen.getByLabelText('E-mail institucional da UFU'), {
      target: { value: 'luis.melo@outro.edu.br' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Criar conta corporativa' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/@ufu\.br/i);
  });

  it('deve aplicar máscara de CPF e telefone, enviar apenas dígitos limpos do CPF em POST /auth/register e redirecionar para /membros', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        accessToken: 'jwt-novo-membro',
        user: {
          id: 'uuid-novo',
          name: 'Luís Fellipe Pereira Melo',
          email: 'luis.melo@asciiej.com.br',
          roleTitle: 'Membro',
          systemRole: 'MEMBRO',
          department: 'A DEFINIR',
          avatarUrl: null,
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/cadastro']}>
        <AuthProvider>
          <Routes>
            <Route path="/cadastro" element={<RegisterPage />} />
            <Route path="/membros" element={<div>Diretório de Membros Autenticado</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Nome completo'), {
      target: { value: 'Luís Fellipe Pereira Melo' },
    });
    fireEvent.change(screen.getByLabelText('E-mail corporativo'), {
      target: { value: 'luis.melo@asciiej.com.br' },
    });
    fireEvent.change(screen.getByLabelText('E-mail institucional da UFU'), {
      target: { value: 'luis.melo@ufu.br' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'Ascii@2026' },
    });
    fireEvent.change(screen.getByLabelText('Confirmação de senha'), {
      target: { value: 'Ascii@2026' },
    });
    fireEvent.change(screen.getByLabelText('Data de aniversário'), {
      target: { value: '2003-05-14' },
    });
    fireEvent.change(screen.getByLabelText('Telefone'), {
      target: { value: '34999998888' },
    });
    fireEvent.change(screen.getByLabelText('CPF'), {
      target: { value: '12345678901' },
    });
    fireEvent.change(screen.getByLabelText('Matrícula UFU'), {
      target: { value: '12111BCC001' },
    });
    fireEvent.change(screen.getByLabelText('Curso de graduação'), {
      target: { value: 'Bacharelado em Sistemas de Informação' },
    });

    expect((screen.getByLabelText('CPF') as HTMLInputElement).value).toBe('123.456.789-01');
    expect((screen.getByLabelText('Telefone') as HTMLInputElement).value).toBe('(34) 99999-8888');

    fireEvent.click(screen.getByRole('button', { name: 'Criar conta corporativa' }));

    await waitFor(() => {
      expect(screen.getByText('Diretório de Membros Autenticado')).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(requestUrl).toContain('/auth/register');
    expect(requestInit.method).toBe('POST');

    const sentPayload = JSON.parse(requestInit.body as string) as Record<string, string>;
    expect(sentPayload.cpf).toBe('12345678901');
    expect(sentPayload.phone).toBe('34999998888');
    expect(sentPayload.course).toBe('Bacharelado em Sistemas de Informação');
    expect(sentPayload.email).toBe('luis.melo@asciiej.com.br');
    expect(sentPayload.ufuEmail).toBe('luis.melo@ufu.br');
  });
});
