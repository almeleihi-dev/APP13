/** PostgreSQL error helpers */
export function isUniqueViolation(error: unknown, constraint?: string): boolean {
  if (!error || typeof error !== "object") return false;
  const pg = error as { code?: string; constraint?: string };
  if (pg.code !== "23505") return false;
  if (constraint && pg.constraint !== constraint) return false;
  return true;
}
