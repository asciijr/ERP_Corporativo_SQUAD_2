import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import { Select } from '../components/atoms/Select';
import { FormField } from '../components/molecules/FormField';
import { AuthLayout } from '../components/templates/AuthLayout';
import { useAuth } from '../hooks/AuthContext';
import { formatCpfMask, formatPhoneMask } from '../services/membersService';
import { UNDERGRADUATE_COURSES } from '../types/member';

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [ufuEmail, setUfuEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');
  const [ufuRegistration, setUfuRegistration] = useState<string>('');
  const [course, setCourse] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (isAuthenticated) {
    return <Navigate to="/membros" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUfuEmail = ufuEmail.trim().toLowerCase();
    const trimmedRegistration = ufuRegistration.trim();
    const cleanCpf = cpf.replace(/\D/g, '');
    const cleanPhone = phone.replace(/\D/g, '');

    if (
      !trimmedName ||
      !trimmedEmail ||
      !trimmedUfuEmail ||
      !password ||
      !confirmPassword ||
      !birthDate ||
      !phone.trim() ||
      !cleanCpf ||
      !trimmedRegistration ||
      !course
    ) {
      setErrorMessage('Preencha todos os campos obrigatórios para criar sua conta corporativa.');
      return;
    }

    if (!trimmedEmail.endsWith('@asciiej.com.br')) {
      setErrorMessage('O e-mail corporativo deve pertencer ao domínio @asciiej.com.br.');
      return;
    }

    if (!trimmedUfuEmail.endsWith('@ufu.br')) {
      setErrorMessage('O e-mail institucional da UFU deve pertencer ao domínio @ufu.br.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('A confirmação de senha não confere com a senha informada.');
      return;
    }

    if (cleanPhone.length < 10) {
      setErrorMessage('Informe um telefone válido com DDD no formato (34) 99999-9999.');
      return;
    }

    if (cleanCpf.length !== 11) {
      setErrorMessage('Informe um CPF válido com 11 dígitos.');
      return;
    }

    if (!UNDERGRADUATE_COURSES.includes(course as (typeof UNDERGRADUATE_COURSES)[number])) {
      setErrorMessage('Selecione um curso de graduação válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: trimmedName,
        email: trimmedEmail,
        ufuEmail: trimmedUfuEmail,
        password,
        birthDate,
        phone: cleanPhone,
        cpf: cleanCpf,
        ufuRegistration: trimmedRegistration,
        course,
      });
      navigate('/membros', { replace: true });
    } catch (error) {
      if (error instanceof Error && error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          'Não foi possível criar a conta corporativa. Verifique se o e-mail, CPF ou matrícula já estão cadastrados.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout maxWidthClass="max-w-2xl" logoVariant="horizontal">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold uppercase text-brand-blue">
          CADASTRO CORPORATIVO
        </h1>
        <p className="mt-1 text-sm text-muted">
          Crie sua conta institucional na ASCII Soluções em Tecnologia
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-danger bg-danger-100 px-3 py-2.5 text-sm font-medium text-danger"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          id="register-name"
          label="Nome completo"
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Digite seu nome completo"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSubmitting}
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            id="register-email"
            label="E-mail corporativo"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="luis.melo@asciiej.com.br"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
            required
          />

          <FormField
            id="register-ufu-email"
            label="E-mail institucional da UFU"
            type="email"
            name="ufuEmail"
            placeholder="nome@ufu.br"
            value={ufuEmail}
            onChange={(event) => setUfuEmail(event.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            id="register-password"
            label="Senha"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Mínimo de 6 caracteres"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            required
          />

          <FormField
            id="register-confirm-password"
            label="Confirmação de senha"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repita sua senha"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            id="register-birth-date"
            label="Data de aniversário"
            type="date"
            name="birthDate"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            disabled={isSubmitting}
            required
          />

          <FormField
            id="register-phone"
            label="Telefone"
            type="tel"
            name="phone"
            placeholder="(34) 99999-9999"
            value={phone}
            onChange={(event) => setPhone(formatPhoneMask(event.target.value))}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            id="register-cpf"
            label="CPF"
            type="text"
            name="cpf"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(event) => setCpf(formatCpfMask(event.target.value))}
            disabled={isSubmitting}
            required
          />

          <FormField
            id="register-ufu-registration"
            label="Matrícula UFU"
            type="text"
            name="ufuRegistration"
            placeholder="Ex.: 12111BCC001"
            value={ufuRegistration}
            onChange={(event) => setUfuRegistration(event.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="register-course" className="text-sm font-medium text-brand-navy">
            Curso de graduação
          </label>
          <Select
            id="register-course"
            name="course"
            value={course}
            onChange={(event) => setCourse(event.target.value)}
            placeholder="Selecione seu curso de graduação"
            disabled={isSubmitting}
            required
            options={UNDERGRADUATE_COURSES.map((courseName) => ({
              value: courseName,
              label: courseName,
            }))}
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            className="w-full"
          >
            Criar conta corporativa
          </Button>
        </div>
      </form>

      <div className="mt-6 border-t border-border pt-4 text-center text-sm text-brand-navy">
        <Link
          to="/login"
          className="font-semibold text-brand-blue underline-offset-4 transition-colors hover:text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
        >
          Já possui conta corporativa? Entrar no sistema
        </Link>
      </div>
    </AuthLayout>
  );
}

export default RegisterPage;
