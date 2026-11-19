import { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import logoHorizontalWhite from '../../../assets/brand/Logo ASCII_Horizontal_Branco.png';

export interface SidebarNavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

export interface SidebarProps {
  items?: SidebarNavItem[];
  canAccessFinance?: boolean;
  canAccessAudit?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

function MembersIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
      />
      <circle cx="9" cy="7" r="4" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
      />
    </svg>
  );
}

function DriveIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  );
}

function PlaybookIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
      />
    </svg>
  );
}

function FinanceIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
      />
    </svg>
  );
}

function AuditIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      />
    </svg>
  );
}

function buildSidebarItems(canAccessFinance: boolean, canAccessAudit: boolean): SidebarNavItem[] {
  const baseItems: SidebarNavItem[] = [
    {
      label: 'Membros',
      path: '/membros',
      icon: <MembersIcon />,
    },
    {
      label: 'Google Drive',
      path: '/drive',
      icon: <DriveIcon />,
    },
    {
      label: 'Playbook e OKRs',
      path: '/playbook-okrs',
      icon: <PlaybookIcon />,
    },
  ];

  if (canAccessFinance) {
    baseItems.push({
      label: 'Fluxo de Caixa',
      path: '/financeiro',
      icon: <FinanceIcon />,
    });
  }

  if (canAccessAudit) {
    baseItems.push({
      label: 'Logs de Auditoria',
      path: '/auditoria',
      icon: <AuditIcon />,
    });
  }

  return baseItems;
}

export function Sidebar({
  items,
  canAccessFinance = false,
  canAccessAudit = false,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const resolvedItems = items ?? buildSidebarItems(canAccessFinance, canAccessAudit);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-brand-navy/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
          data-testid="sidebar-backdrop"
        />
      )}

      <aside
        aria-label="Menu principal"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-brand-navy text-surface transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-navy-700 px-6 py-4">
          <Link
            to="/membros"
            onClick={onClose}
            aria-label="Voltar para a página inicial"
            className="flex cursor-pointer items-center rounded-md transition-all duration-150 ease-out hover:scale-[1.02] hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
          >
            <img
              src={logoHorizontalWhite}
              alt="ASCII Soluções em Tecnologia"
              className="h-10 w-auto max-w-full object-contain"
            />
          </Link>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar menu de navegação"
              className="ml-2 inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-md text-surface transition-all duration-150 ease-out hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue lg:hidden"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navegação lateral">
          {resolvedItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-surface transition-all duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${
                  isActive
                    ? 'border-l-4 border-brand-green bg-navy-700 font-semibold'
                    : 'hover:translate-x-1 hover:bg-navy-700 active:bg-navy-700'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
