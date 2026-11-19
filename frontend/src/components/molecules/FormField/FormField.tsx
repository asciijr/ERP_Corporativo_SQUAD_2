import { forwardRef, useId } from 'react';
import { Input, InputProps } from '../../atoms/Input';

export interface FormFieldProps extends InputProps {
  label: string;
  error?: string;
  hint?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { id, label, error, hint, hasError, className = '', ...inputProps },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const isInvalid = Boolean(error) || Boolean(hasError);

  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`.trim()}>
      <label htmlFor={inputId} className="text-sm font-medium text-brand-navy">
        {label}
      </label>
      <Input
        ref={ref}
        id={inputId}
        hasError={isInvalid}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
