import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('deve renderizar barra em brand-blue quando valor for menor que 100%', () => {
    render(<ProgressBar value={65} label="Playbook Individual" showPercentage />);

    const progressbar = screen.getByRole('progressbar', { name: 'Playbook Individual' });
    const fill = screen.getByTestId('progressbar-fill');

    expect(progressbar).toHaveAttribute('aria-valuenow', '65');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(fill).toHaveClass('bg-brand-blue');
    expect(fill).toHaveStyle({ width: '65%' });
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('deve renderizar barra em brand-green quando atingir 100%', () => {
    render(<ProgressBar value={100} label="Playbook Concluído" />);

    const progressbar = screen.getByRole('progressbar', { name: 'Playbook Concluído' });
    const fill = screen.getByTestId('progressbar-fill');

    expect(progressbar).toHaveAttribute('aria-valuenow', '100');
    expect(fill).toHaveClass('bg-brand-green');
    expect(fill).toHaveStyle({ width: '100%' });
  });

  it('deve limitar valores fora do intervalo entre 0 e 100', () => {
    const { rerender } = render(<ProgressBar value={-25} label="Mínimo" />);
    expect(screen.getByRole('progressbar', { name: 'Mínimo' })).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
    expect(screen.getByTestId('progressbar-fill')).toHaveStyle({ width: '0%' });

    rerender(<ProgressBar value={145} label="Máximo" />);
    expect(screen.getByRole('progressbar', { name: 'Máximo' })).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
    expect(screen.getByTestId('progressbar-fill')).toHaveClass('bg-brand-green');
    expect(screen.getByTestId('progressbar-fill')).toHaveStyle({ width: '100%' });
  });
});
