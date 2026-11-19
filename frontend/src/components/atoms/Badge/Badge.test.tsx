import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('deve renderizar com variante blue por padrão', () => {
    render(<Badge>Projetos</Badge>);
    const badge = screen.getByText('Projetos');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-700');
  });

  it('deve aplicar corretamente as variantes navy, green e danger mantendo contraste oficial', () => {
    const { rerender } = render(<Badge variant="navy">Presidência</Badge>);
    expect(screen.getByText('Presidência')).toHaveClass('bg-brand-navy', 'text-surface');

    rerender(<Badge variant="green">Concluído</Badge>);
    expect(screen.getByText('Concluído')).toHaveClass('bg-green-100', 'text-brand-navy');

    rerender(<Badge variant="danger">Inativo</Badge>);
    expect(screen.getByText('Inativo')).toHaveClass('bg-danger-100', 'text-danger');
  });
});
