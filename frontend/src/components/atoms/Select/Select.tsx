import { forwardRef, ReactNode, SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  options?: SelectOption[];
  placeholder?: string;
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { hasError = false, options, placeholder, className = '', children, ...rest },
  ref,
) {
  const borderClass = hasError
    ? 'border-danger focus-visible:outline-danger'
    : 'border-border focus-visible:outline-brand-blue';

  return (
    <select
      ref={ref}
      aria-invalid={hasError}
      className={`h-10 min-h-10 w-full cursor-pointer rounded-md border bg-surface px-3 py-2 text-sm text-brand-navy transition-colors focus-visible:outline-2 focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted ${borderClass} ${className}`.trim()}
      {...rest}
    >
      {placeholder !== undefined && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options
        ? options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))
        : children}
    </select>
  );
});
