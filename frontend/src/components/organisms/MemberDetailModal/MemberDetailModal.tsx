import { Avatar } from '../../atoms/Avatar';
import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { ProgressBar } from '../../atoms/ProgressBar';
import { Modal } from '../Modal';
import { MemberProfile } from '../../../types/member';

export interface MemberDetailModalProps {
  member: MemberProfile | null;
  isOpen: boolean;
  onClose: () => void;
  canViewAdminData?: boolean;
  onEditRole?: (member: MemberProfile) => void;
}

function formatCpfDisplay(cpf?: string | null): string {
  if (!cpf) {
    return 'Não informado';
  }
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) {
    return cpf;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

function formatDateDisplay(dateValue?: string | null): string {
  if (!dateValue) {
    return 'Não informada';
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateValue);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  return dateValue;
}

export function MemberDetailModal({
  member,
  isOpen,
  onClose,
  canViewAdminData = false,
  onEditRole,
}: MemberDetailModalProps) {
  if (!member) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={member.name}
      subtitle={`${member.roleTitle} • ${member.department}`}
      maxWidthClass="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          {canViewAdminData && onEditRole && (
            <Button variant="primary" onClick={() => onEditRole(member)}>
              Gerenciar Cargo / Editar
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Avatar name={member.name} avatarUrl={member.avatarUrl} size="lg" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="navy">{member.department}</Badge>
              {member.squadName && <Badge variant="blue">{member.squadName}</Badge>}
              <Badge variant={member.isActive ? 'green' : 'danger'}>
                {member.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <p className="text-sm font-semibold text-brand-navy">{member.roleTitle}</p>
            <p className="text-xs text-muted">{member.email}</p>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-canvas p-3">
            <dt className="text-xs font-medium text-muted">Curso de graduação</dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">
              {member.course || 'Não informado'}
            </dd>
          </div>

          <div className="rounded-md border border-border bg-canvas p-3">
            <dt className="text-xs font-medium text-muted">Período / Semestre</dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">
              {member.semester || 'Não informado'}
            </dd>
          </div>

          <div className="rounded-md border border-border bg-canvas p-3">
            <dt className="text-xs font-medium text-muted">Diretoria</dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">{member.department}</dd>
          </div>

          <div className="rounded-md border border-border bg-canvas p-3">
            <dt className="text-xs font-medium text-muted">Squad atual</dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">
              {member.squadName || 'Sem squad alocado'}
            </dd>
          </div>
        </dl>

        <div>
          <h3 className="mb-2 text-xs font-bold uppercase text-brand-blue">Tags de Proficiência</h3>
          {member.skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {member.skills.map((skill) => (
                <Badge key={skill} variant="blue">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted">Nenhuma tag de proficiência cadastrada.</p>
          )}
        </div>

        <div className="rounded-md border border-border bg-canvas p-4">
          <ProgressBar
            value={member.playbookProgress ?? 0}
            label="Progresso do Playbook"
            showPercentage
          />
        </div>

        {canViewAdminData && (
          <div
            data-testid="member-admin-details"
            className="rounded-lg border border-blue-200 bg-blue-50 p-4"
          >
            <h3 className="text-xs font-extrabold uppercase text-brand-blue">
              Dados Administrativos e Institucionais
            </h3>
            <dl className="mt-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div>
                <dt className="font-medium text-muted">E-mail corporativo</dt>
                <dd className="mt-0.5 font-semibold text-brand-navy">{member.email}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted">E-mail institucional UFU</dt>
                <dd className="mt-0.5 font-semibold text-brand-navy">
                  {member.ufuEmail || 'Não informado'}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted">CPF</dt>
                <dd className="mt-0.5 font-semibold text-brand-navy">
                  {formatCpfDisplay(member.cpf)}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted">Matrícula UFU</dt>
                <dd className="mt-0.5 font-semibold text-brand-navy">
                  {member.ufuRegistration || 'Não informada'}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted">Telefone</dt>
                <dd className="mt-0.5 font-semibold text-brand-navy">
                  {member.phone || 'Não informado'}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted">Data de aniversário</dt>
                <dd className="mt-0.5 font-semibold text-brand-navy">
                  {formatDateDisplay(member.birthDate)}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted">Nível de acesso no ERP</dt>
                <dd className="mt-0.5 font-semibold text-brand-navy">{member.accessLevel}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </Modal>
  );
}
