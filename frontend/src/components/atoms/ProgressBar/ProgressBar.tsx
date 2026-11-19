export interface ProgressBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  label = 'Progresso',
  showPercentage = false,
  className = '',
}: ProgressBarProps) {
  const safeNumber = Number.isFinite(value) ? value : 0;
  const clampedValue = Math.min(100, Math.max(0, Math.round(safeNumber)));
  const isCompleted = clampedValue === 100;
  const barColorClass = isCompleted ? 'bg-brand-green' : 'bg-brand-blue';

  return (
    <div className={`w-full ${className}`.trim()}>
      {(label || showPercentage) && (
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-brand-navy">
          <span>{label}</span>
          {showPercentage && <span className="font-semibold">{clampedValue}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2.5 w-full overflow-hidden rounded-full bg-blue-100"
      >
        <div
          data-testid="progressbar-fill"
          className={`h-full rounded-full transition-all duration-200 ease-out ${barColorClass}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
