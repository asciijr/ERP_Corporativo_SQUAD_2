import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Header } from './Header';

describe('Header', () => {
  it('deve exibir o nome, cargo, avatar do usuário e acionar onLogout ao clicar em Sair', () => {
    const handleLogout = vi.fn();

    render(<Header userName="Ana Clara" userRoleTitle="Presidente" onLogout={handleLogout} />);

    expect(screen.getByText('Ana Clara')).toBeInTheDocument();
    expect(screen.getByText('Presidente')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Avatar de Ana Clara' })).toBeInTheDocument();

    const logoutButton = screen.getByRole('button', { name: /Sair/i });
    fireEvent.click(logoutButton);
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });
});
