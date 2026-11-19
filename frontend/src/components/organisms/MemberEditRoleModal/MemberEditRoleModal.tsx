import { FormEvent, useEffect, useState } from 'react';
import { Button } from '../../atoms/Button';
import { Select } from '../../atoms/Select';
import { FormField } from '../../molecules/FormField';
import { Modal } from '../Modal';
import { AccessLevel } from '../../../types/auth';
import {
  ASCII_DEPARTMENTS,
  ASCII_ROLE_TITLES,
  MemberProfile,
  UpdateMemberRolePayload,
} from '../../../types/member';

export interface MemberEditRoleModalProps {
  member: MemberProfile | null;
  isOpen: boolean;
  isPresidencia: boolean;
  isSaving?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSave: (memberId: string, payload: UpdateMemberRolePayload) => Promise<void> | void;
}

export function MemberEditRoleModal({
  member,
  isOpen,
  isPresidencia,
  isSaving = false,
  errorMessage = null,
  onClose,
  onSave,
}: MemberEditRoleModalProps) {
  const [roleTitle, setRoleTitle] = useState<string>('Trainee');
  const [department, setDepartment] = useState<string>('PROJETOS');
  const [squadName, setSquadName] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('MEMBRO');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (member && isOpen) {
      const normalizedCurrentRole = ASCII_ROLE_TITLES.find(
        (role) => role.toLowerCase() === member.roleTitle.trim().toLowerCase(),
      );
      setRoleTitle(normalizedCurrentRole ?? 'Trainee');
      setDepartment(member.department || 'PROJETOS');
      setSquadName(member.squadName ?? '');
      setIsActive(member.isActive);
      setAccessLevel(member.accessLevel);
      setValidationError(null);
    }
  }, [member, isOpen]);

  if (!member) {
    return null;
  }

  const roleOptions = ASCII_ROLE_TITLES.map((role) => ({
    value: role,
    label: role,
  }));

  const departmentOptions = Array.from(
    new Set([...ASCII_DEPARTMENTS, member.department].filter(Boolean)),
  ).map((dept) => ({
    value: dept,
    label: dept,
  }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    const trimmedRoleTitle = roleTitle.trim();
    const trimmedDepartment = department.trim();

    if (!trimmedRoleTitle || !trimmedDepartment) {
      setValidationError('O cargo e a diretoria são obrigatórios.');
      return;
    }

    const payload: UpdateMemberRolePayload = {
      roleTitle: trimmedRoleTitle,
      department: trimmedDepartment,
      squadName: squadName.trim() ? squadName.trim() : null,
      isActive,
    };

    if (isPresidencia) {
      payload.accessLevel = accessLevel;
    }

    await onSave(member.id, payload);
  };

  const displayedError = validationError ?? errorMessage;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gerenciar Cargo e Alocação"
      subtitle={`Editando atribuições corporativas de ${member.name}`}
      maxWidthClass="max-w-lg"
    >
      {displayedError && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-danger bg-danger-100 px-3 py-2.5 text-sm font-medium text-danger"
        >
          {displayedError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit-member-role-title" className="text-sm font-medium text-brand-navy">
            Cargo na ASCII
          </label>
          <Select
            id="edit-member-role-title"
            value={roleTitle}
            onChange={(event) => setRoleTitle(event.target.value)}
            options={roleOptions}
            disabled={isSaving}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit-member-department" className="text-sm font-medium text-brand-navy">
            Diretoria
          </label>
          <Select
            id="edit-member-department"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            options={departmentOptions}
            disabled={isSaving}
          />
        </div>

        <FormField
          id="edit-member-squad"
          label="Squad"
          value={squadName}
          onChange={(event) => setSquadName(event.target.value)}
          placeholder="Ex.: Squad 2"
          disabled={isSaving}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit-member-status" className="text-sm font-medium text-brand-navy">
            Status do membro
          </label>
          <Select
            id="edit-member-status"
            value={isActive ? 'true' : 'false'}
            onChange={(event) => setIsActive(event.target.value === 'true')}
            disabled={isSaving}
            options={[
              { value: 'true', label: 'Ativo' },
              { value: 'false', label: 'Inativo' },
            ]}
          />
        </div>

        {isPresidencia && (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-member-access-level"
              className="text-sm font-medium text-brand-navy"
            >
              Nível de acesso no sistema
            </label>
            <Select
              id="edit-member-access-level"
              value={accessLevel}
              onChange={(event) => setAccessLevel(event.target.value as AccessLevel)}
              disabled={isSaving}
              options={[
                { value: 'MEMBRO', label: 'MEMBRO — Assessor / Trainee (Acesso operacional)' },
                { value: 'DIRETOR', label: 'DIRETOR — Gestão de diretoria e auditoria' },
                { value: 'PRESIDENCIA', label: 'ADMIN — Acesso administrativo total' },
              ]}
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={isSaving}>
            Salvar alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}
