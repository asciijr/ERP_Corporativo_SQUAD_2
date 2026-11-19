import { Input } from '../../atoms/Input';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  id?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar...',
  ariaLabel = 'Buscar',
  id = 'search-bar-input',
  className = '',
}: SearchBarProps) {
  return (
    <div role="search" className={`relative w-full ${className}`.trim()}>
      <span
        className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted"
        aria-hidden="true"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
        </svg>
      </span>

      <Input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="pl-9 pr-10"
      />

      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
          className="absolute inset-y-0 right-0 inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-r-md text-muted transition-colors hover:text-brand-navy focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand-blue"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
