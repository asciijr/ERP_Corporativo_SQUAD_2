import { Avatar } from '../components/atoms/Avatar';
import { useAuth } from '../hooks/AuthContext';
import { AccessLevel } from '../types/auth';

const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  PRESIDENCIA: 'Presidência',
  DIRETOR: 'Diretoria',
  MEMBRO: 'Membro',
};

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold uppercase text-brand-blue">MEU PERFIL</h1>
        <p className="mt-1 text-sm font-medium text-muted">
          Dados institucionais e credenciais de acesso na ASCII
        </p>
      </header>

      <section className="rounded-lg border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col items-start gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
          <Avatar name={user.name} avatarUrl={user.avatarUrl} size="lg" />
          <div>
            <h2 className="text-lg font-extrabold text-brand-blue">{user.name}</h2>
            <p className="text-sm font-medium text-brand-navy">{user.roleTitle}</p>
            <p className="text-xs text-muted">{user.email}</p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-md border border-border bg-canvas p-4">
            <dt className="text-xs font-medium text-muted">E-mail corporativo</dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">{user.email}</dd>
          </div>

          <div className="rounded-md border border-border bg-canvas p-4">
            <dt className="text-xs font-medium text-muted">Cargo atual</dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">{user.roleTitle}</dd>
          </div>

          <div className="rounded-md border border-border bg-canvas p-4">
            <dt className="text-xs font-medium text-muted">Nível de acesso</dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">
              {ACCESS_LEVEL_LABELS[user.systemRole]} ({user.systemRole})
            </dd>
          </div>

          <div className="rounded-md border border-border bg-canvas p-4">
            <dt className="text-xs font-medium text-muted">Departamento</dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">{user.department}</dd>
          </div>
        </dl>

        <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-brand-navy">
          A edição de dados cadastrais, foto de perfil e atualização de proficiências estará
          disponível nesta seção na próxima entrega.
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;
