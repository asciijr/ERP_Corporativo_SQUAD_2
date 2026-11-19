import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import { FormField } from '../components/molecules/FormField';
import { AuthLayout } from '../components/templates/AuthLayout';
import { useAuth } from '../hooks/AuthContext';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (isAuthenticated) {
    return <Navigate to="/membros" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setErrorMessage('Preencha o e-mail corporativo e a senha para continuar.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: trimmedEmail, password });
      navigate('/membros', { replace: true });
    } catch (error) {
      if (error instanceof Error && error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Credenciais inválidas. Verifique seus dados e tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold uppercase text-brand-blue">
          ACESSO AO SISTEMA
        </h1>
        <p className="mt-1 text-sm text-muted">Entre com sua conta institucional da ASCII</p>
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
          id="login-email"
          label="E-mail corporativo"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="nome@ascii.org.br"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmitting}
          required
        />

        <FormField
          id="login-password"
          label="Senha"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Digite sua senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
          required
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            className="w-full"
          >
            Entrar
          </Button>
        </div>
      </form>

      <div className="mt-6 border-t border-border pt-4 text-center text-sm text-brand-navy">
        <Link
          to="/cadastro"
          className="font-semibold text-brand-blue underline-offset-4 transition-colors hover:text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
        >
          Ainda não tem conta? Criar conta corporativa
        </Link>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;
