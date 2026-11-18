/** Safe contact / social URL helpers — no hardcoded destinations. */

export function digitsOnly(value: string) {
  return value.replace(/[^\d+]/g, "").trim();
}

export function toTelHref(phone: string) {
  const cleaned = digitsOnly(phone);
  if (!cleaned) return "";
  return cleaned.startsWith("+") || cleaned.startsWith("00") ? `tel:${cleaned}` : `tel:${cleaned}`;
}

export function toMailtoHref(email: string) {
  const value = email.trim();
  if (!value || !value.includes("@")) return "";
  return `mailto:${value}`;
}

export function toWhatsAppHref(value: string) {
  const raw = value.trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const digits = raw.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export function toTelegramHref(value: string) {
  const raw = value.trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const handle = raw.replace(/^@/, "").trim();
  return handle ? `https://t.me/${handle}` : "";
}

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Normalize a stored social/contact URL for safe external opening. */
export function normalizeExternalHref(raw: string, iconOrPlatform = "") {
  const value = raw.trim();
  if (!value) return "";

  if (value.startsWith("mailto:") || value.startsWith("tel:")) return value;

  const key = iconOrPlatform.toLowerCase();
  if (key === "phone" || key === "tel") return toTelHref(value);
  if (key === "whatsapp") return toWhatsAppHref(value);
  if (key === "telegram") return toTelegramHref(value);
  if (key === "email" || key === "mail") return toMailtoHref(value);

  if (isHttpUrl(value)) return value;
  if (value.includes("@") && !value.includes(" ")) return toMailtoHref(value);
  if (/^[\d+\s()-]{8,}$/.test(value)) return toTelHref(value);

  // Prevent relative paths becoming internal SPA 404s.
  if (value.startsWith("//")) return `https:${value}`;
  if (!/^https?:\/\//i.test(value) && value.includes(".")) {
    return `https://${value.replace(/^\/+/, "")}`;
  }
  return "";
}

export function isInternalSafeScheme(href: string) {
  return href.startsWith("mailto:") || href.startsWith("tel:");
}

export function externalLinkProps(href: string) {
  if (isInternalSafeScheme(href)) {
    return {} as const;
  }
  return { target: "_blank" as const, rel: "noopener noreferrer" as const };
}
