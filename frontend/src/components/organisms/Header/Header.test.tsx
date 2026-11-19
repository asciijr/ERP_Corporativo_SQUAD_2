import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Header } from './Header';

describe('Header', () => {
  it('deve exibir nome, cargo e avatar no trigger de perfil e abrir o menu dropdown ao clicar', () => {
    const handleLogout = vi.fn();
    const handleEditProfile = vi.fn();

    render(
      <Header
        userName="Ana Clara"
        userRoleTitle="Presidente"
        onLogout={handleLogout}
        onEditProfile={handleEditProfile}
      />,
    );

    const trigger = screen.getByRole('button', {
      name: /Menu de perfil de Ana Clara/i,
    });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Ana Clara')).toBeInTheDocument();
    expect(screen.getByText('Presidente')).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Editar perfil' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Sair' })).toBeInTheDocument();
  });

  it('deve fechar o dropdown ao pressionar Esc ou clicar fora', () => {
    render(<Header userName="Ana Clara" userRoleTitle="Presidente" onLogout={vi.fn()} />);

    const trigger = screen.getByRole('button', {
      name: /Menu de perfil de Ana Clara/i,
    });

    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('deve acionar onEditProfile ao clicar em Editar perfil e onLogout ao clicar em Sair', () => {
    const handleLogout = vi.fn();
    const handleEditProfile = vi.fn();

    render(
      <Header
        userName="Ana Clara"
        userRoleTitle="Presidente"
        onLogout={handleLogout}
        onEditProfile={handleEditProfile}
      />,
    );

    const trigger = screen.getByRole('button', {
      name: /Menu de perfil de Ana Clara/i,
    });

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Editar perfil' }));
    expect(handleEditProfile).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Sair' }));
    expect(handleLogout).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
