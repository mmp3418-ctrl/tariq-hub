/** Canonical material types aligned with admin educational_materials.material_type */

export type MaterialTypeKey =
  | "classbook"
  | "workbook"
  | "notebook"
  | "grammar"
  | "worksheet"
  | "vocabulary"
  | "book"
  | "note";

export const MATERIAL_TYPE_BADGES: Record<
  string,
  { ar: string; en: string }
> = {
  classbook: { ar: "كتاب حصة", en: "Coursebook" },
  workbook: { ar: "كتاب واجب", en: "Workbook" },
  notebook: { ar: "كراسة", en: "Notebook" },
  grammar: { ar: "قواعد", en: "Grammar" },
  worksheet: { ar: "ورقة عمل", en: "Worksheet" },
  vocabulary: { ar: "مفردات", en: "Vocabulary" },
  // Legacy admin values
  book: { ar: "كتاب حصة", en: "Coursebook" },
  note: { ar: "كراسة", en: "Notes" },
  // Arabic values stored directly
  "كتاب حصة": { ar: "كتاب حصة", en: "Coursebook" },
  "كتاب واجب": { ar: "كتاب واجب", en: "Workbook" },
  كراسة: { ar: "كراسة", en: "Notebook" },
  قواعد: { ar: "قواعد", en: "Grammar" },
  "ورقة عمل": { ar: "ورقة عمل", en: "Worksheet" },
  مفردات: { ar: "مفردات", en: "Vocabulary" },
};

export function normalizeMaterialType(raw: string | null | undefined): string {
  const value = (raw ?? "").trim();
  if (!value) return "classbook";
  const lower = value.toLowerCase();
  if (MATERIAL_TYPE_BADGES[value]) return value;
  if (MATERIAL_TYPE_BADGES[lower]) return lower;
  if (lower.includes("واجب") || lower.includes("workbook") || lower.includes("homework")) {
    return "workbook";
  }
  if (lower.includes("مفرد") || lower.includes("vocab")) return "vocabulary";
  if (lower.includes("قاعد") || lower.includes("grammar")) return "grammar";
  if (lower.includes("كراس") || lower.includes("notebook")) return "notebook";
  if (lower.includes("ورق") || lower.includes("worksheet") || lower.includes("question")) {
    return "worksheet";
  }
  if (lower.includes("حص") || lower.includes("class") || lower.includes("course")) {
    return "classbook";
  }
  if (lower === "book") return "book";
  if (lower === "note") return "note";
  return value;
}

export function materialTypeBadge(
  raw: string | null | undefined,
  locale: "ar" | "en" = "ar",
): string {
  const key = normalizeMaterialType(raw);
  const found = MATERIAL_TYPE_BADGES[key];
  if (found) return locale === "en" ? found.en : found.ar;
  return key || (locale === "en" ? "Material" : "مادة");
}
