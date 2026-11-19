import { ReactNode, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from '../../organisms/Footer';
import { Header } from '../../organisms/Header';
import { Sidebar, SidebarNavItem } from '../../organisms/Sidebar';

export interface AppLayoutProps {
  userName?: string;
  userRoleTitle?: string;
  userAvatarUrl?: string | null;
  canAccessFinance?: boolean;
  canAccessAudit?: boolean;
  sidebarItems?: SidebarNavItem[];
  onLogout?: () => void;
  onEditProfile?: () => void;
  title?: string;
  children?: ReactNode;
}

export function AppLayout({
  userName = 'Membro ASCII',
  userRoleTitle = 'Membro',
  userAvatarUrl = null,
  canAccessFinance = false,
  canAccessAudit = false,
  sidebarItems,
  onLogout = () => undefined,
  onEditProfile,
  title,
  children,
}: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  return (
    <div className="flex min-h-screen w-full bg-canvas font-sans text-brand-navy">
      <Sidebar
        items={sidebarItems}
        canAccessFinance={canAccessFinance}
        canAccessAudit={canAccessAudit}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header
          userName={userName}
          userRoleTitle={userRoleTitle}
          userAvatarUrl={userAvatarUrl}
          onLogout={onLogout}
          onEditProfile={onEditProfile}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
          title={title}
        />

        <main className="flex-1 bg-canvas p-4 lg:p-6">
          <div className="mx-auto w-full max-w-7xl">{children ?? <Outlet />}</div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
