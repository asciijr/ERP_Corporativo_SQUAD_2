import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from './Select';

describe('Select', () => {
  it('deve renderizar com altura 40px (h-10), cursor-pointer e opções informadas', () => {
    render(
      <Select
        aria-label="Curso de graduação"
        defaultValue=""
        placeholder="Selecione um curso"
        options={[
          {
            value: 'Bacharelado em Ciência da Computação',
            label: 'Bacharelado em Ciência da Computação',
          },
          {
            value: 'Bacharelado em Sistemas de Informação',
            label: 'Bacharelado em Sistemas de Informação',
          },
        ]}
      />,
    );

    const select = screen.getByLabelText('Curso de graduação');
    expect(select).toBeInTheDocument();
    expect(select).toHaveClass('h-10', 'cursor-pointer', 'border-border');
    expect(select).toHaveAttribute('aria-invalid', 'false');
    expect(
      screen.getByRole('option', { name: 'Bacharelado em Ciência da Computação' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Bacharelado em Sistemas de Informação' }),
    ).toBeInTheDocument();
  });

  it('deve sinalizar estado de erro quando hasError for true e disparar onChange', () => {
    const handleChange = vi.fn();
    render(
      <Select
        aria-label="Diretoria"
        hasError
        onChange={handleChange}
        options={[
          { value: 'PROJETOS', label: 'Projetos' },
          { value: 'FINANCEIRO', label: 'Financeiro' },
        ]}
      />,
    );

    const select = screen.getByLabelText('Diretoria');
    expect(select).toHaveClass('border-danger');
    expect(select).toHaveAttribute('aria-invalid', 'true');

    fireEvent.change(select, { target: { value: 'FINANCEIRO' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
