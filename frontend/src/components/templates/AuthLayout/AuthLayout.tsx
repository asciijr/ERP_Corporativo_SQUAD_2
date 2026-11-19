import { ReactNode } from 'react';

export interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-navy to-brand-blue p-4 font-sans text-brand-navy">
      {/* Padrão discreto de mapa de pontos em SVG com baixa opacidade */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-15"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="ascii-dot-map"
            x="0"
            y="0"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="4" cy="4" r="1.5" className="fill-blue-200" />
            <circle cx="18" cy="14" r="1" className="fill-surface" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ascii-dot-map)" />
      </svg>

      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-navy text-surface"
            aria-hidden="true"
          >
            <svg className="h-6 w-6 text-brand-green" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="7" cy="7" r="2" />
              <circle cx="17" cy="7" r="2" />
              <circle cx="12" cy="12" r="2.2" />
              <circle cx="7" cy="17" r="2" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          </div>
          <div>
            <span className="block font-display text-xl font-bold uppercase tracking-wider text-brand-navy">
              ASCII
            </span>
            <span className="block text-xs font-medium text-muted">Soluções em Tecnologia</span>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
