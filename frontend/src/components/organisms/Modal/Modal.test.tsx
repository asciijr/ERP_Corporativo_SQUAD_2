import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
  it('não deve renderizar conteúdo quando isOpen for false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Detalhes do Membro">
        <p>Conteúdo interno</p>
      </Modal>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('deve renderizar com aria-modal="true", overlay brand-navy/60 e painel rounded-xl quando aberto', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Detalhes do Membro" subtitle="Squad 2">
        <p>Conteúdo interno do modal</p>
      </Modal>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Detalhes do Membro' });
    const overlay = screen.getByTestId('modal-overlay');

    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveClass('rounded-xl', 'bg-surface');
    expect(overlay).toHaveClass('bg-brand-navy/60');
    expect(screen.getByText('Conteúdo interno do modal')).toBeInTheDocument();
    expect(screen.getByText('Squad 2')).toBeInTheDocument();
  });

  it('deve acionar onClose ao pressionar Escape ou ao clicar no botão fechar', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Gerenciar Cargo">
        <p>Formulário</p>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Fechar modal' }));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
