import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { Avatar } from '../components/atoms/Avatar';
import { Badge } from '../components/atoms/Badge';
import { Button } from '../components/atoms/Button';
import { Select } from '../components/atoms/Select';
import { FormField } from '../components/molecules/FormField';
import { useAuth } from '../hooks/AuthContext';
import { formatCpfMask, formatPhoneMask, membersService } from '../services/membersService';
import { AccessLevel } from '../types/auth';
import { UNDERGRADUATE_COURSES, UNDERGRADUATE_SEMESTERS } from '../types/member';

const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  PRESIDENCIA: 'Admin',
  DIRETOR: 'Diretoria',
  MEMBRO: 'Membro',
};

function parseSkillsInput(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ),
  );
}

export function ProfilePage() {
  const { user, token, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState<string>(user?.name ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl ?? '');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string>(user?.phone ? formatPhoneMask(user.phone) : '');
  const [course, setCourse] = useState<string>(user?.course ?? '');
  const [semester, setSemester] = useState<string>(user?.semester ?? '');
  const [skillsInput, setSkillsInput] = useState<string>((user?.skills ?? []).join(', '));

  const [ufuEmail, setUfuEmail] = useState<string | null>(user?.ufuEmail ?? null);
  const [cpf, setCpf] = useState<string | null>(user?.cpf ?? null);
  const [ufuRegistration, setUfuRegistration] = useState<string | null>(
    user?.ufuRegistration ?? null,
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }
    setName(user.name);
    setAvatarUrl(user.avatarUrl ?? '');
    setPhone(user.phone ? formatPhoneMask(user.phone) : '');
    setCourse(user.course ?? '');
    setSemester(user.semester ?? '');
    setSkillsInput((user.skills ?? []).join(', '));
    setUfuEmail(user.ufuEmail ?? null);
    setCpf(user.cpf ?? null);
    setUfuRegistration(user.ufuRegistration ?? null);
  }, [user]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;
    membersService
      .getMyProfile(token)
      .then((profile) => {
        if (!isMounted || !profile.id) {
          return;
        }
        setName(profile.name);
        setAvatarUrl(profile.avatarUrl ?? '');
        setPhone(profile.phone ? formatPhoneMask(profile.phone) : '');
        setCourse(profile.course ?? '');
        setSemester(profile.semester ?? '');
        setSkillsInput((profile.skills ?? []).join(', '));
        setUfuEmail(profile.ufuEmail ?? null);
        setCpf(profile.cpf ?? null);
        setUfuRegistration(profile.ufuRegistration ?? null);
      })
      .catch(() => {
        // Mantém os dados do AuthContext caso o endpoint opcional de detalhe não esteja disponível
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (!user) {
    return null;
  }

  const parsedSkills = parseSkillsInput(skillsInput);
  const courseOptions = Array.from(new Set([...UNDERGRADUATE_COURSES, course].filter(Boolean))).map(
    (courseOption) => ({
      value: courseOption,
      label: courseOption,
    }),
  );

  const semesterOptions = Array.from(
    new Set([...UNDERGRADUATE_SEMESTERS, semester].filter(Boolean)),
  ).map((semOption) => ({
    value: semOption,
    label: semOption,
  }));

  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Selecione um arquivo de imagem válido (PNG, JPG ou WEBP).');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setErrorMessage('A imagem selecionada excede o limite máximo de 4 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setSelectedFileName(file.name);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Não foi possível ler o arquivo de imagem selecionado.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    setSelectedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('O nome completo não pode ficar em branco.');
      return;
    }

    if (!token) {
      setErrorMessage('Sessão expirada. Faça login novamente.');
      return;
    }

    setIsSaving(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const updatedProfile = await membersService.updateMyProfile(token, {
        name: trimmedName,
        avatarUrl: avatarUrl.trim() ? avatarUrl.trim() : null,
        phone: cleanPhone ? cleanPhone : undefined,
        course: course.trim() ? course.trim() : undefined,
        semester: semester.trim() ? semester.trim() : undefined,
        skills: parsedSkills,
      });

      updateUser({
        name: updatedProfile.name || trimmedName,
        avatarUrl:
          updatedProfile.avatarUrl !== undefined
            ? updatedProfile.avatarUrl
            : avatarUrl.trim() || null,
        phone: updatedProfile.phone ?? (cleanPhone || null),
        course: updatedProfile.course ?? (course.trim() || null),
        semester: updatedProfile.semester ?? (semester.trim() || null),
        skills: updatedProfile.skills?.length ? updatedProfile.skills : parsedSkills,
      });

      setSuccessMessage('Perfil atualizado com sucesso!');
    } catch (error) {
      if (error instanceof Error && error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Não foi possível atualizar seu perfil. Tente novamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold uppercase text-brand-blue">MEU PERFIL</h1>
        <p className="mt-1 text-sm font-medium text-muted">
          Dados institucionais, credenciais de acesso e atualização cadastral na ASCII
        </p>
      </header>

      <section className="rounded-lg border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col items-start gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
          <Avatar name={name.trim() || user.name} avatarUrl={avatarUrl.trim() || null} size="lg" />
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-brand-blue">{name.trim() || user.name}</h2>
            <p className="text-sm font-medium text-brand-navy">{user.roleTitle}</p>
            <p className="text-xs text-muted">{user.email}</p>
          </div>
        </div>

        <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-brand-navy">
          O cargo atual, a diretoria e o nível de acesso são atribuídos pela gestão da ASCII.
        </div>

        <h3 className="mt-6 text-sm font-extrabold uppercase text-brand-blue">
          Dados Institucionais (Somente Leitura)
        </h3>

        <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-md border border-border bg-canvas p-4">
            <dt className="text-xs font-medium text-muted">Cargo atual</dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">{user.roleTitle}</dd>
          </div>

          <div className="rounded-md border border-border bg-canvas p-4">
            <dt className="text-xs font-medium text-muted">Diretoria</dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">{user.department}</dd>
          </div>

          <div className="rounded-md border border-border bg-canvas p-4">
            <dt className="text-xs font-medium text-muted">Nível de acesso</dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">
              {ACCESS_LEVEL_LABELS[user.systemRole]} ({user.systemRole})
            </dd>
          </div>

          <div className="rounded-md border border-border bg-canvas p-4">
            <dt className="text-xs font-medium text-muted">E-mail corporativo</dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">{user.email}</dd>
          </div>

          <div className="rounded-md border border-border bg-canvas p-4">
            <dt className="text-xs font-medium text-muted">E-mail institucional UFU</dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">
              {ufuEmail || 'Não informado'}
            </dd>
          </div>

          <div className="rounded-md border border-border bg-canvas p-4">
            <dt className="text-xs font-medium text-muted">CPF</dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">
              {cpf ? formatCpfMask(cpf) : 'Não informado'}
            </dd>
          </div>

          <div className="rounded-md border border-border bg-canvas p-4">
            <dt className="text-xs font-medium text-muted">Matrícula UFU</dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">
              {ufuRegistration || 'Não informada'}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-border bg-surface p-6 shadow-card">
        <h3 className="text-lg font-extrabold text-brand-blue">Editar Dados Pessoais e Perfil</h3>
        <p className="mt-1 text-xs text-muted">
          Atualize sua foto, telefone, curso, período e tags de proficiência técnica.
        </p>

        {successMessage && (
          <div
            role="status"
            className="mt-4 rounded-md border border-brand-green bg-green-100 px-4 py-3 text-sm font-semibold text-brand-navy"
          >
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mt-4 rounded-md border border-danger bg-danger-100 px-4 py-3 text-sm font-medium text-danger"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="profile-name"
              label="Nome completo"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSaving}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="profile-avatar-upload"
                className="text-sm font-medium text-brand-navy"
              >
                Foto de perfil (Avatar)
              </label>
              <input
                ref={fileInputRef}
                id="profile-avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                disabled={isSaving}
                className="sr-only"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isSaving}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Enviar foto do computador
                </Button>
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isSaving}
                    onClick={handleRemoveAvatar}
                  >
                    Remover foto
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted">
                {selectedFileName
                  ? `Arquivo selecionado: ${selectedFileName}`
                  : 'Formatos aceitos: PNG, JPG ou WEBP (até 4 MB).'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              id="profile-phone"
              label="Telefone"
              type="tel"
              placeholder="(34) 99999-9999"
              value={phone}
              onChange={(event) => setPhone(formatPhoneMask(event.target.value))}
              disabled={isSaving}
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="profile-course" className="text-sm font-medium text-brand-navy">
                Curso de graduação
              </label>
              <Select
                id="profile-course"
                value={course}
                onChange={(event) => setCourse(event.target.value)}
                placeholder="Selecione seu curso"
                disabled={isSaving}
                options={courseOptions}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="profile-semester" className="text-sm font-medium text-brand-navy">
                Período / Semestre
              </label>
              <Select
                id="profile-semester"
                value={semester}
                onChange={(event) => setSemester(event.target.value)}
                placeholder="Selecione o período"
                disabled={isSaving}
                options={semesterOptions}
              />
            </div>
          </div>

          <div>
            <FormField
              id="profile-skills"
              label="Tags de proficiência"
              placeholder="Ex.: TypeScript, React, NestJS, PostgreSQL"
              value={skillsInput}
              onChange={(event) => setSkillsInput(event.target.value)}
              disabled={isSaving}
              hint="Separe suas competências por vírgula."
            />

            {parsedSkills.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Preview de proficiências">
                {parsedSkills.map((skill) => (
                  <Badge key={skill} variant="blue">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end border-t border-border pt-4">
            <Button type="submit" variant="primary" loading={isSaving}>
              Salvar alterações
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ProfilePage;
