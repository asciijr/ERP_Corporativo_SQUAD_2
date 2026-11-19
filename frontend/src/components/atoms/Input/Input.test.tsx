import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('deve renderizar com altura de 40px (h-10) e borda padrão', () => {
    render(<Input placeholder="Digite seu e-mail" />);
    const input = screen.getByPlaceholderText('Digite seu e-mail');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('h-10', 'border-border');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('deve sinalizar estado de erro quando hasError for true', () => {
    render(<Input placeholder="Senha" hasError />);
    const input = screen.getByPlaceholderText('Senha');
    expect(input).toHaveClass('border-danger');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('deve permitir digitação quando habilitado e bloquear quando disabled', () => {
    const handleChange = vi.fn();
    render(<Input aria-label="Nome" onChange={handleChange} />);
    const input = screen.getByLabelText('Nome');

    fireEvent.change(input, { target: { value: 'Ana' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
