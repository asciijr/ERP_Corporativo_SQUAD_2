export interface FooterProps {
  variant?: 'default' | 'auth';
  className?: string;
}

export function Footer({ variant = 'default', className = '' }: FooterProps) {
  const isAuth = variant === 'auth';

  const containerClass = isAuth
    ? 'mt-6 w-full text-center text-xs text-surface/85'
    : 'mt-auto w-full shrink-0 border-t border-border bg-surface px-4 py-3 text-xs text-muted lg:px-6';

  return (
    <footer aria-label="Rodapé institucional" className={`${containerClass} ${className}`.trim()}>
      <div
        className={
          isAuth
            ? 'mx-auto flex flex-col items-center justify-center gap-1'
            : 'mx-auto flex max-w-7xl flex-col items-center justify-between gap-1 sm:flex-row'
        }
      >
        <p className={isAuth ? 'font-medium text-surface' : 'font-medium text-brand-navy'}>
          © 2026 ASCII Soluções em Tecnologia — Empresa Júnior da FACOM / UFU
        </p>
        <p className={isAuth ? 'text-surface/80' : 'text-muted'}>
          Campus Santa Mônica • Uberlândia, MG
        </p>
      </div>
    </footer>
  );
}
