import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
  it('deve exibir apenas Membros, Google Drive e Playbook e OKRs para membro comum', () => {
    render(
      <MemoryRouter initialEntries={['/membros']}>
        <Sidebar canAccessFinance={false} canAccessAudit={false} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Membros' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Google Drive' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Playbook e OKRs' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Fluxo de Caixa' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Logs de Auditoria' })).not.toBeInTheDocument();
  });

  it('deve exibir Logs de Auditoria para diretor não-financeiro, mas ocultar Fluxo de Caixa', () => {
    render(
      <MemoryRouter initialEntries={['/membros']}>
        <Sidebar canAccessFinance={false} canAccessAudit={true} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Logs de Auditoria' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Fluxo de Caixa' })).not.toBeInTheDocument();
  });

  it('deve exibir Fluxo de Caixa e Logs de Auditoria para Presidência ou Diretor Financeiro', () => {
    render(
      <MemoryRouter initialEntries={['/financeiro']}>
        <Sidebar canAccessFinance={true} canAccessAudit={true} />
      </MemoryRouter>,
    );

    const financeLink = screen.getByRole('link', { name: 'Fluxo de Caixa' });
    expect(financeLink).toBeInTheDocument();
    expect(financeLink).toHaveClass('bg-navy-700', 'border-brand-green');
    expect(screen.getByRole('link', { name: 'Logs de Auditoria' })).toBeInTheDocument();
  });
});
