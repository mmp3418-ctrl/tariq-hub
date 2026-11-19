/** UUID shape (Postgres gen_random_uuid / uuid columns) */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value.trim());
}

/** Empty / "1" / invalid → null (never send to uuid columns). */
export function toUuidOrNull(value: unknown): string | null {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw || raw === "1" || raw === "0") return null;
  return isUuid(raw) ? raw : null;
}
