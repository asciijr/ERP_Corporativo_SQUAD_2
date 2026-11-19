import { ReactNode } from 'react';
import logoIsolatedColors from '../../../assets/brand/Logo ASCII_Isolado_Cores.png';

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
        <div className="mb-6 flex justify-center">
          <img
            src={logoIsolatedColors}
            alt="ASCII Soluções em Tecnologia"
            className="h-20 w-auto object-contain"
          />
        </div>

        {children}
      </div>
    </div>
  );
}
