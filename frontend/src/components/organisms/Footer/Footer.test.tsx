import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  it('deve exibir as informações institucionais da ASCII e localização do Campus Santa Mônica', () => {
    render(<Footer />);

    const footer = screen.getByRole('contentinfo', { name: 'Rodapé institucional' });
    expect(footer).toBeInTheDocument();
    expect(
      screen.getByText('© 2026 ASCII Soluções em Tecnologia — Empresa Júnior da FACOM / UFU'),
    ).toBeInTheDocument();
    expect(screen.getByText('Campus Santa Mônica • Uberlândia, MG')).toBeInTheDocument();
  });

  it('deve suportar a variante discreta auth sobre fundo escuro', () => {
    render(<Footer variant="auth" />);

    expect(
      screen.getByText('© 2026 ASCII Soluções em Tecnologia — Empresa Júnior da FACOM / UFU'),
    ).toHaveClass('text-surface');
  });
});
