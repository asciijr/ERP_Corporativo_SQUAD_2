import { useCallback, useEffect, useState } from 'react';

interface HealthResponse {
  status: string;
}

export default function App() {
  const [apiStatus, setApiStatus] = useState<string>('carregando...');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const checkHealth = useCallback(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    setIsLoading(true);
    setHasError(false);
    setApiStatus('carregando...');

    fetch(`${apiUrl}/health`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Falha ao consultar API');
        }
        const data = (await response.json()) as HealthResponse;
        setApiStatus(data.status);
        setHasError(false);
      })
      .catch(() => {
        setApiStatus('indisponível');
        setHasError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const badgeToneClass = hasError
    ? 'bg-danger-100 text-danger'
    : isLoading
      ? 'bg-blue-100 text-brand-navy'
      : 'bg-green-100 text-brand-navy';

  return (
    <main className="min-h-screen bg-canvas p-4 font-sans text-brand-navy lg:p-6">
      <div className="mx-auto max-w-7xl">
        <section className="mx-auto max-w-lg rounded-lg border border-border bg-surface p-6 shadow-card">
          <h1 className="font-display text-3xl font-bold uppercase text-brand-blue">
            ERP CORPORATIVO — ASCII
          </h1>
          <p className="mt-2 text-sm text-muted">
            Módulos Corporativos (Squad 2) — FACOM/UFU
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span
              role="status"
              aria-live="polite"
              className={`inline-flex min-h-10 items-center rounded-md px-3 py-1 text-sm font-semibold ${badgeToneClass}`}
            >
              API: {apiStatus}
            </span>

            {hasError && (
              <button
                type="button"
                onClick={checkHealth}
                className="inline-flex min-h-10 items-center rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-surface transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
              >
                Tentar novamente
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
