import { ReactNode } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/templates/AppLayout';
import { AuthProvider, useAuth } from './hooks/AuthContext';
import { LoginPage } from './pages/LoginPage';

interface ModulePlaceholderProps {
  title: string;
  subtitle: string;
  description: string;
}

function ModulePlaceholder({ title, subtitle, description }: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold uppercase text-brand-blue">{title}</h1>
        <p className="mt-1 text-sm font-medium text-muted">{subtitle}</p>
      </header>

      <section className="rounded-lg border border-border bg-surface p-6 shadow-card">
        <h2 className="text-lg font-extrabold text-brand-blue">Módulo Corporativo ASCII</h2>
        <p className="mt-2 text-sm text-brand-navy">{description}</p>
      </section>
    </div>
  );
}

export function PrivateRoute() {
  const { user, isAuthenticated, isLoading, canAccessFinance, isPresidencia, isDirector, logout } =
    useAuth();

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-screen items-center justify-center bg-canvas p-4 font-sans text-sm font-semibold text-brand-navy"
      >
        Validando sessão...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout
      userName={user.name}
      userRoleTitle={user.roleTitle}
      userAvatarUrl={user.avatarUrl}
      canAccessFinance={canAccessFinance}
      canAccessAudit={isPresidencia || isDirector}
      onLogout={logout}
    >
      <Outlet />
    </AppLayout>
  );
}

interface PermissionGuardProps {
  allowed: boolean;
  children: ReactNode;
}

function PermissionGuard({ allowed, children }: PermissionGuardProps) {
  if (!allowed) {
    return <Navigate to="/membros" replace />;
  }
  return <>{children}</>;
}

export function AppRoutes() {
  const { canAccessFinance, isPresidencia, isDirector } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<PrivateRoute />}>
        <Route
          path="/membros"
          element={
            <ModulePlaceholder
              title="DIRETÓRIO DE MEMBROS"
              subtitle="Gestão de talentos, cargos, squads e proficiências da ASCII"
              description="Visualize e gerencie os membros ativos, diretorias e trilhas de desenvolvimento."
            />
          }
        />
        <Route
          path="/drive"
          element={
            <ModulePlaceholder
              title="HUB DO GOOGLE DRIVE"
              subtitle="Acesso rápido aos diretórios e documentos oficiais por diretoria"
              description="Consulte pastas institucionais, modelos e arquivos organizados por área."
            />
          }
        />
        <Route
          path="/playbook-okrs"
          element={
            <ModulePlaceholder
              title="PLAYBOOK E OKRS"
              subtitle="Metas estratégicas, checklists individuais e acompanhamento de squads"
              description="Acompanhe os indicadores trimestrais e o progresso de capacitação."
            />
          }
        />
        <Route
          path="/financeiro"
          element={
            <PermissionGuard allowed={canAccessFinance}>
              <ModulePlaceholder
                title="FLUXO DE CAIXA"
                subtitle="Controle financeiro restrito à Presidência e Diretoria Financeira"
                description="Acompanhe entradas, saídas, saldo mensal e categorização financeira."
              />
            </PermissionGuard>
          }
        />
        <Route
          path="/auditoria"
          element={
            <PermissionGuard allowed={isPresidencia || isDirector}>
              <ModulePlaceholder
                title="LOGS DE AUDITORIA"
                subtitle="Rastreabilidade transversal de ações críticas no ERP"
                description="Consulte o histórico de operações por autor, módulo e data."
              />
            </PermissionGuard>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/membros" replace />} />
      <Route path="*" element={<Navigate to="/membros" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
