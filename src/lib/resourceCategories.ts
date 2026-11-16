import type { Locale } from "../i18n/messages.ts";

export const RESOURCE_CATEGORIES = [
  { value: "classbook", key: "categoryClassbook" },
  { value: "workbook", key: "categoryWorkbook" },
  { value: "vocabulary", key: "categoryVocabulary" },
  { value: "grammar", key: "categoryGrammar" },
  { value: "questions", key: "categoryQuestions" },
] as const;

export function categoryLabel(
  category: string,
  t: (key: string) => string,
  locale: Locale,
) {
  const found = RESOURCE_CATEGORIES.find((item) => item.value === category);
  if (found) return t(found.key);
  if (!category) return t("categoryOther");
  return locale === "en" ? category : category;
}
