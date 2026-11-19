import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('deve renderizar o texto e aplicar a variante primary por padrão', () => {
    render(<Button>Confirmar</Button>);
    const button = screen.getByRole('button', { name: 'Confirmar' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-brand-blue', 'text-surface');
  });

  it('deve aplicar corretamente as variantes secondary, accent, danger e ghost', () => {
    const { rerender } = render(<Button variant="secondary">Secundário</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-brand-blue', 'text-brand-blue');

    rerender(<Button variant="accent">Destaque</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-brand-green', 'text-brand-navy');

    rerender(<Button variant="danger">Excluir</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-danger', 'text-surface');

    rerender(<Button variant="ghost">Cancelar</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-brand-navy');
  });

  it('deve desabilitar o botão e exibir spinner quando loading for true', () => {
    const handleClick = vi.fn();
    render(
      <Button loading onClick={handleClick}>
        Salvando
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Salvando' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByTestId('button-loading-spinner')).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('deve acionar onClick quando habilitado', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Entrar</Button>);

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
