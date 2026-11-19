import { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { hasError = false, className = '', ...rest },
  ref,
) {
  const borderClass = hasError
    ? 'border-danger focus-visible:outline-danger'
    : 'border-border focus-visible:outline-brand-blue';

  return (
    <input
      ref={ref}
      aria-invalid={hasError}
      className={`h-10 min-h-10 w-full rounded-md border bg-surface px-3 py-2 text-sm text-brand-navy placeholder:text-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted ${borderClass} ${className}`.trim()}
      {...rest}
    />
  );
});
