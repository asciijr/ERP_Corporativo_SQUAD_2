import { useEffect, useRef, useState } from 'react';
import { Avatar } from '../../atoms/Avatar';

export interface HeaderProps {
  userName: string;
  userRoleTitle: string;
  userAvatarUrl?: string | null;
  onLogout: () => void;
  onEditProfile?: () => void;
  onOpenMenu?: () => void;
  title?: string;
}

export function Header({
  userName,
  userRoleTitle,
  userAvatarUrl,
  onLogout,
  onEditProfile,
  onOpenMenu,
  title,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleEditProfileClick = () => {
    setIsMenuOpen(false);
    onEditProfile?.();
  };

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    onLogout();
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4 lg:px-6">
      <div className="flex items-center gap-3">
        {onOpenMenu && (
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Abrir menu de navegação"
            className="inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-md text-brand-navy transition-all duration-150 ease-out hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue lg:hidden"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {title && <span className="text-sm font-semibold text-brand-navy">{title}</span>}
      </div>

      <div ref={menuContainerRef} className="relative">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          aria-label={`Menu de perfil de ${userName}`}
          onClick={() => setIsMenuOpen((previous) => !previous)}
          className="inline-flex min-h-10 cursor-pointer items-center gap-3 rounded-lg border border-transparent px-2.5 py-1.5 text-left transition-all duration-150 ease-out hover:border-border hover:bg-blue-50 active:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
        >
          <div className="text-right">
            <p className="text-sm font-semibold text-brand-navy">{userName}</p>
            <p className="text-xs text-muted">{userRoleTitle}</p>
          </div>

          <Avatar name={userName} avatarUrl={userAvatarUrl} size="md" />

          <svg
            className={`h-4 w-4 text-muted transition-transform duration-150 ease-out ${
              isMenuOpen ? 'rotate-180' : ''
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {isMenuOpen && (
          <div
            role="menu"
            aria-label="Opções da conta"
            className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-border bg-surface p-1.5 shadow-card"
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleEditProfileClick}
              className="flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium text-brand-navy transition-all duration-150 ease-out hover:bg-blue-50 active:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand-blue"
            >
              <svg
                className="h-4 w-4 shrink-0 text-brand-blue"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Editar perfil</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleLogoutClick}
              className="mt-1 flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium text-danger transition-all duration-150 ease-out hover:bg-danger-100 active:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand-blue"
            >
              <svg
                className="h-4 w-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                />
              </svg>
              <span>Sair</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
