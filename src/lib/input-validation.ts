/**
 * Límites de entrada para APIs (OWASP A03 Injection, A01 Access Control).
 * Recortar y validar tamaños evita abusos y posibles vectores de inyección.
 */

export const INPUT_LIMITS = {
  /** Longitud máxima de búsqueda libre (search) */
  searchMaxLength: 200,
  /** Longitud máxima de filtro por empresa o rol */
  filterFieldMaxLength: 150,
  /** Máximo de tags/categorías en una sola petición */
  tagListMaxLength: 50,
  /** Longitud máxima por tag/categoría */
  tagItemMaxLength: 80,
  /** Página máxima (límite superior para skip) */
  maxPage: 10_000,
  /** Límite máximo de items por página */
  maxLimit: 100,
} as const;

export function clampSearch(value: string | null | undefined): string {
  if (value == null) return "";
  const s = String(value).trim().slice(0, INPUT_LIMITS.searchMaxLength);
  return s;
}

export function clampFilterField(value: string | null | undefined): string {
  if (value == null) return "";
  return String(value).trim().slice(0, INPUT_LIMITS.filterFieldMaxLength);
}

export function clampTagList(items: string[]): string[] {
  return items
    .map((t) => String(t).trim().slice(0, INPUT_LIMITS.tagItemMaxLength))
    .filter(Boolean)
    .slice(0, INPUT_LIMITS.tagListMaxLength);
}

export function clampPage(value: number): number {
  return Math.max(1, Math.min(INPUT_LIMITS.maxPage, Math.floor(Number(value)) || 1));
}

export function clampLimit(value: number, defaultVal: number, max: number = INPUT_LIMITS.maxLimit): number {
  const n = Math.floor(Number(value)) || defaultVal;
  return Math.max(1, Math.min(max, n));
}
