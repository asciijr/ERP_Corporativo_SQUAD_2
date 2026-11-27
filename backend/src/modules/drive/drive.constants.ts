/**
 * Códigos de categoria gravados no banco (DriveCard.category).
 * O rótulo com acento ("Presidência", "Recursos Humanos"...) fica no frontend.
 */
export const DRIVE_CARD_CATEGORIES = [
  'PRESIDENCIA',
  'RH',
  'FINANCEIRO',
  'PROJETOS',
  'COMERCIAL',
  'GERAL',
] as const;

export type DriveCardCategory = (typeof DRIVE_CARD_CATEGORIES)[number];

/** Valor do campo `module` nos logs de auditoria deste módulo. */
export const DRIVE_AUDIT_MODULE = 'DRIVE';
