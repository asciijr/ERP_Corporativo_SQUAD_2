import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormField } from './FormField';

describe('FormField', () => {
  it('deve associar a label ao input via htmlFor/id', () => {
    render(<FormField id="email-input" label="E-mail corporativo" />);
    const input = screen.getByLabelText('E-mail corporativo');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'email-input');
  });

  it('deve exibir mensagem de erro em danger e marcar o input como inválido', () => {
    render(<FormField id="password-input" label="Senha" error="A senha é obrigatória." />);

    const input = screen.getByLabelText('Senha');
    const alert = screen.getByRole('alert');

    expect(alert).toHaveTextContent('A senha é obrigatória.');
    expect(alert).toHaveClass('text-danger');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
