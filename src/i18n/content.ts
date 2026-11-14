import type { Locale } from "./messages.ts";

const stages: Record<string, { title: string; kicker: string; summary: string }> = {
  primary: {
    title: "Primary stage",
    kicker: "Foundation",
    summary: "Grades one through six. Reading, writing, and arithmetic on a calm path.",
  },
  preparatory: {
    title: "Preparatory stage",
    kicker: "Prep",
    summary: "Seventh, eighth, and ninth grades before secondary school.",
  },
  secondary: {
    title: "Secondary stage",
    kicker: "Specialization",
    summary: "First secondary, then science and arts tracks in second and third year.",
  },
};

const grades: Record<string, { title: string; subtitle: string }> = {
  "primary-1": { title: "Grade 1", subtitle: "Start of letters and numbers" },
  "primary-2": { title: "Grade 2", subtitle: "Strengthening reading and arithmetic" },
  "primary-3": { title: "Grade 3", subtitle: "Widening foundational understanding" },
  "primary-4": { title: "Grade 4", subtitle: "Moving into clearer subjects" },
  "primary-5": { title: "Grade 5", subtitle: "Building study independence" },
  "primary-6": { title: "Grade 6", subtitle: "Closing the primary stage" },
  "prep-1": { title: "1st preparatory", subtitle: "Grade 7" },
  "prep-2": { title: "2nd preparatory", subtitle: "Grade 8" },
  "prep-3": { title: "3rd preparatory", subtitle: "Grade 9" },
  "sec-1": { title: "1st secondary", subtitle: "Secondary foundation year" },
  "sec-2-science": { title: "2nd secondary · Science", subtitle: "Science track" },
  "sec-2-arts": { title: "2nd secondary · Arts", subtitle: "Arts track" },
  "sec-3-science": { title: "3rd secondary · Science", subtitle: "Final year · Science" },
  "sec-3-arts": { title: "3rd secondary · Arts", subtitle: "Final year · Arts" },
};

const subjects: Record<string, string> = {
  AR: "Arabic",
  MA: "Mathematics",
  SC: "Science",
};

export function stageLabel(locale: Locale, id: string, fallback: string, field: "title" | "kicker" | "summary" = "title") {
  if (locale === "ar") return fallback;
  return stages[id]?.[field] ?? fallback;
}

export function gradeLabel(locale: Locale, id: string, fallback: string, field: "title" | "subtitle" = "title") {
  if (locale === "ar") return fallback;
  return grades[id]?.[field] ?? fallback;
}

export function subjectLabel(locale: Locale, code: string, fallback: string) {
  if (locale === "ar") return fallback;
  return subjects[code] ?? fallback;
}
