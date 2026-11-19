import { useState } from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: AvatarSize;
  className?: string;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

const BRAND_TONE_CLASSES: readonly string[] = [
  'bg-brand-blue text-surface',
  'bg-brand-navy text-surface',
  'bg-blue-700 text-surface',
  'bg-navy-700 text-surface',
  'bg-blue-100 text-brand-navy',
  'bg-green-100 text-brand-navy',
];

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);

  if (parts.length === 0) {
    return 'AS';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const firstInitial = parts[0][0] ?? '';
  const lastInitial = parts[parts.length - 1][0] ?? '';
  return `${firstInitial}${lastInitial}`.toUpperCase();
}

function getDeterministicToneClass(name: string): string {
  const normalized = name.trim().toLowerCase();
  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) >>> 0;
  }
  return BRAND_TONE_CLASSES[hash % BRAND_TONE_CLASSES.length];
}

export function Avatar({ name, avatarUrl, size = 'md', className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState<boolean>(false);
  const showImage = Boolean(avatarUrl && !imageError);
  const initials = getInitials(name);
  const toneClass = getDeterministicToneClass(name);

  if (showImage && avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`Foto de ${name}`}
        onError={() => setImageError(true)}
        className={`inline-block shrink-0 rounded-full border border-border object-cover ${SIZE_CLASSES[size]} ${className}`.trim()}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`Avatar de ${name}`}
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold ${SIZE_CLASSES[size]} ${toneClass} ${className}`.trim()}
    >
      {initials}
    </div>
  );
}
