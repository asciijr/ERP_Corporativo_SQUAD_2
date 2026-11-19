import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../components/atoms/Button';
import { SearchBar } from '../components/molecules/SearchBar';
import { MemberCard } from '../components/organisms/MemberCard';
import { MemberDetailModal } from '../components/organisms/MemberDetailModal';
import { MemberEditRoleModal } from '../components/organisms/MemberEditRoleModal';
import { useAuth } from '../hooks/AuthContext';
import { membersService } from '../services/membersService';
import { MemberProfile, UpdateMemberRolePayload } from '../types/member';

const ALL_SQUADS_FILTER = 'TODOS';

export function MembersDirectoryPage() {
  const { token, isPresidencia, isDirector } = useAuth();
  const canManageMembers = isPresidencia || isDirector;

  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSquad, setSelectedSquad] = useState<string>(ALL_SQUADS_FILTER);

  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);
  const [editingMember, setEditingMember] = useState<MemberProfile | null>(null);
  const [isSavingRole, setIsSavingRole] = useState<boolean>(false);
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await membersService.listMembers(token);
      setMembers(result);
    } catch (error) {
      if (error instanceof Error && error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Não foi possível carregar o diretório de membros.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const visibleMembers = useMemo(() => {
    return members.filter(
      (member) =>
        member.accessLevel !== 'PRESIDENCIA' &&
        member.roleTitle.trim().toLowerCase() !== 'admin' &&
        member.department.trim().toUpperCase() !== 'ADMIN',
    );
  }, [members]);

  const squadFilters = useMemo(() => {
    const uniqueSquads = Array.from(
      new Set(
        visibleMembers
          .map((member) => member.squadName)
          .filter((squad): squad is string => Boolean(squad && squad.trim().length > 0)),
      ),
    );
    return [ALL_SQUADS_FILTER, ...uniqueSquads];
  }, [visibleMembers]);

  const filteredMembers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return visibleMembers.filter((member) => {
      const matchesSquad =
        selectedSquad === ALL_SQUADS_FILTER || member.squadName === selectedSquad;

      if (!matchesSquad) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const matchesName = member.name.toLowerCase().includes(normalizedQuery);
      const matchesRole = member.roleTitle.toLowerCase().includes(normalizedQuery);
      const matchesDepartment = member.department.toLowerCase().includes(normalizedQuery);

      return matchesName || matchesRole || matchesDepartment;
    });
  }, [visibleMembers, searchQuery, selectedSquad]);

  const handleSelectMember = (member: MemberProfile) => {
    setSelectedMember(member);
    if (canManageMembers && token && !member.cpf && !member.ufuRegistration) {
      membersService
        .getMemberById(token, member.id)
        .then((detailed) => {
          setSelectedMember((current) =>
            current && current.id === member.id ? { ...current, ...detailed } : current,
          );
        })
        .catch(() => {
          // Mantém dados básicos do card se a busca detalhada falhar
        });
    }
  };

  const handleOpenEditModal = (member: MemberProfile) => {
    setEditErrorMessage(null);
    setSelectedMember(null);
    setEditingMember(member);
  };

  const handleSaveRole = async (memberId: string, payload: UpdateMemberRolePayload) => {
    if (!token) {
      return;
    }

    setIsSavingRole(true);
    setEditErrorMessage(null);

    try {
      const updatedMember = await membersService.updateMemberRole(token, memberId, payload);
      setMembers((previous) =>
        previous.map((item) =>
          item.id === memberId
            ? {
                ...item,
                ...updatedMember,
                id: memberId,
                roleTitle: updatedMember.roleTitle || payload.roleTitle,
                department: updatedMember.department || payload.department,
                squadName:
                  updatedMember.squadName !== undefined
                    ? updatedMember.squadName
                    : (payload.squadName ?? null),
                isActive:
                  updatedMember.isActive !== undefined ? updatedMember.isActive : payload.isActive,
                accessLevel: updatedMember.accessLevel || payload.accessLevel || item.accessLevel,
              }
            : item,
        ),
      );
      setEditingMember(null);
    } catch (error) {
      if (error instanceof Error && error.message) {
        setEditErrorMessage(error.message);
      } else {
        setEditErrorMessage('Falha ao salvar alterações do cargo.');
      }
    } finally {
      setIsSavingRole(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold uppercase text-brand-blue">
          DIRETÓRIO DE MEMBROS
        </h1>
        <p className="mt-1 text-sm font-medium text-muted">
          Gestão de talentos, cargos, squads e proficiências da ASCII
        </p>
      </header>

      <section className="rounded-lg border border-border bg-surface p-4 shadow-card sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar membro por nome ou cargo..."
              ariaLabel="Buscar membro por nome ou cargo"
            />
          </div>

          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Filtrar por Squad"
          >
            {squadFilters.map((squad) => {
              const isSelected = selectedSquad === squad;
              const label = squad === ALL_SQUADS_FILTER ? 'Todos os Squads' : squad;

              return (
                <button
                  key={squad}
                  type="button"
                  onClick={() => setSelectedSquad(squad)}
                  aria-pressed={isSelected}
                  className={`min-h-10 cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${
                    isSelected
                      ? 'bg-brand-blue text-surface'
                      : 'border border-border bg-canvas text-brand-navy hover:bg-blue-50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {isLoading ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-border bg-surface p-8 text-center text-sm font-medium text-brand-navy shadow-card"
        >
          Carregando diretório de membros...
        </div>
      ) : errorMessage ? (
        <div
          role="alert"
          className="flex flex-col items-center justify-between gap-4 rounded-lg border border-danger bg-danger-100 p-6 text-sm text-danger sm:flex-row"
        >
          <span className="font-medium">{errorMessage}</span>
          <Button variant="secondary" size="sm" onClick={() => void loadMembers()}>
            Tentar novamente
          </Button>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-8 text-center shadow-card">
          <h2 className="text-base font-extrabold text-brand-blue">Nenhum membro encontrado</h2>
          <p className="mt-1 text-sm text-muted">
            Ajuste os filtros de busca ou selecione outro Squad para visualizar membros.
          </p>
          {(searchQuery || selectedSquad !== ALL_SQUADS_FILTER) && (
            <div className="mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSquad(ALL_SQUADS_FILTER);
                }}
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} onSelect={handleSelectMember} />
          ))}
        </div>
      )}

      <MemberDetailModal
        member={selectedMember}
        isOpen={Boolean(selectedMember)}
        onClose={() => setSelectedMember(null)}
        canViewAdminData={canManageMembers}
        onEditRole={canManageMembers ? handleOpenEditModal : undefined}
      />

      {canManageMembers && (
        <MemberEditRoleModal
          member={editingMember}
          isOpen={Boolean(editingMember)}
          isPresidencia={isPresidencia}
          isSaving={isSavingRole}
          errorMessage={editErrorMessage}
          onClose={() => setEditingMember(null)}
          onSave={handleSaveRole}
        />
      )}
    </div>
  );
}

export default MembersDirectoryPage;
