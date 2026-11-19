import { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant = 'blue' | 'navy' | 'green' | 'danger';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  blue: 'border-blue-200 bg-blue-100 text-blue-700',
  navy: 'border-brand-navy bg-brand-navy text-surface',
  green: 'border-brand-green bg-green-100 text-brand-navy',
  danger: 'border-danger bg-danger-100 text-danger',
};

export function Badge({ variant = 'blue', className = '', children, ...rest }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${VARIANT_CLASSES[variant]} ${className}`.trim()}
      {...rest}
    >
      {children}
    </span>
  );
}
