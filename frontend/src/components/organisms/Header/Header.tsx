import { Avatar } from '../../atoms/Avatar';
import { Button } from '../../atoms/Button';

export interface HeaderProps {
  userName: string;
  userRoleTitle: string;
  userAvatarUrl?: string | null;
  onLogout: () => void;
  onOpenMenu?: () => void;
  title?: string;
}

export function Header({
  userName,
  userRoleTitle,
  userAvatarUrl,
  onLogout,
  onOpenMenu,
  title,
}: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4 lg:px-6">
      <div className="flex items-center gap-3">
        {onOpenMenu && (
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Abrir menu de navegação"
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md text-brand-navy hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue lg:hidden"
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

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-brand-navy">{userName}</p>
            <p className="text-xs text-muted">{userRoleTitle}</p>
          </div>
          <Avatar name={userName} avatarUrl={userAvatarUrl} size="md" />
        </div>

        <Button variant="ghost" size="sm" onClick={onLogout} aria-label="Sair da conta">
          Sair
        </Button>
      </div>
    </header>
  );
}
