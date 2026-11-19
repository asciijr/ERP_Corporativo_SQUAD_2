import { Avatar } from '../../atoms/Avatar';
import { Badge, BadgeVariant } from '../../atoms/Badge';
import { MemberProfile } from '../../../types/member';

export interface MemberCardProps {
  member: MemberProfile;
  onSelect: (member: MemberProfile) => void;
}

function getDepartmentBadgeVariant(department: string): BadgeVariant {
  if (department === 'PRESIDENCIA') {
    return 'navy';
  }
  if (department === 'FINANCEIRO') {
    return 'green';
  }
  return 'blue';
}

export function MemberCard({ member, onSelect }: MemberCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(member)}
      aria-label={`Ver detalhes de ${member.name}`}
      className="group flex w-full cursor-pointer flex-col justify-between rounded-lg border border-border bg-surface p-5 text-left shadow-card transition-all duration-150 ease-out hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-md active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
    >
      <div className="flex items-start gap-4">
        <Avatar name={member.name} avatarUrl={member.avatarUrl} size="lg" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-base font-extrabold text-brand-blue group-hover:text-blue-700">
              {member.name}
            </h3>
            {!member.isActive && <Badge variant="danger">Inativo</Badge>}
          </div>

          <p className="mt-0.5 truncate text-sm font-medium text-brand-navy">{member.roleTitle}</p>
          {member.course && (
            <p className="mt-0.5 truncate text-xs text-muted">
              {member.course}
              {member.semester ? ` • ${member.semester}` : ''}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <Badge variant={getDepartmentBadgeVariant(member.department)}>{member.department}</Badge>
        {member.squadName && <Badge variant="blue">{member.squadName}</Badge>}
      </div>
    </button>
  );
}
