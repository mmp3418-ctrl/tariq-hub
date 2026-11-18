import type { DbGrade, DbLesson, DbResource, DbUnit } from "../lib/supabase.ts";
import {
  listCatalogLessons,
  listCatalogNotes,
  listGrades,
  listPulse,
  listStages,
} from "./curriculum.ts";
import type {
  CatalogLesson,
  CatalogNote,
  CurriculumLesson,
  CurriculumUnit,
  Grade,
  PlatformPulse,
  Stage,
  StageId,
} from "./types.ts";

const stageMeta: Record<
  StageId,
  { index: string; kickerAr: string; kickerEn: string; titleAr: string; titleEn: string; summaryAr: string; summaryEn: string }
> = {
  primary: {
    index: "01",
    kickerAr: "التأسيس",
    kickerEn: "Foundation",
    titleAr: "المرحلة الابتدائية",
    titleEn: "Primary stage",
    summaryAr: "من الصف الأول إلى السادس. قراءة وكتابة وحساب في مسار هادئ.",
    summaryEn: "Grades one through six. Reading, writing, and arithmetic on a calm path.",
  },
  preparatory: {
    index: "02",
    kickerAr: "الإعداد",
    kickerEn: "Preparation",
    titleAr: "المرحلة الإعدادية",
    titleEn: "Preparatory stage",
    summaryAr: "الصفوف السابع والثامن والتاسع قبل عبور الثانوية.",
    summaryEn: "Seventh, eighth, and ninth grades before secondary school.",
  },
  secondary: {
    index: "03",
    kickerAr: "التخصص",
    kickerEn: "Specialization",
    titleAr: "المرحلة الثانوية",
    titleEn: "Secondary stage",
    summaryAr: "أول ثانوي، ثم المساران العلمي والأدبي في الثاني والثالث.",
    summaryEn: "First secondary, then science and arts tracks in second and third year.",
  },
};

export function stagesFromLocale(locale: "ar" | "en"): Stage[] {
  return (Object.keys(stageMeta) as StageId[]).map((id) => {
    const meta = stageMeta[id];
    return {
      id,
      index: meta.index,
      kicker: locale === "en" ? meta.kickerEn : meta.kickerAr,
      title: locale === "en" ? meta.titleEn : meta.titleAr,
      summary: locale === "en" ? meta.summaryEn : meta.summaryAr,
    };
  });
}

export function mapDbGrades(rows: DbGrade[], locale: "ar" | "en"): Grade[] {
  return [...rows]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row, index) => ({
      id: row.slug || row.id,
      dbId: row.id,
      stageId: row.stage,
      index: String(index + 1).padStart(2, "0"),
      title: locale === "en" ? row.title_en : row.title_ar,
      subtitle: locale === "en" ? stageMeta[row.stage].titleEn : stageMeta[row.stage].titleAr,
      isComingSoon: Boolean(row.is_coming_soon),
    }));
}

export function localizedTitle(
  locale: "ar" | "en",
  row: { title?: string | null; title_ar?: string | null; title_en?: string | null },
) {
  if (locale === "en") return (row.title_en || row.title || row.title_ar || "").trim();
  return (row.title_ar || row.title || row.title_en || "").trim();
}

export function mapDbUnits(rows: DbUnit[], locale: "ar" | "en", grades: Grade[]): CurriculumUnit[] {
  const gradeDbIds = new Map(grades.map((grade) => [grade.dbId || grade.id, grade.id]));
  return [...rows]
    .map((row, index) => ({
      id: row.id,
      gradeId: gradeDbIds.get(row.grade_id) || row.grade_id,
      title: localizedTitle(locale, row) || `Unit ${index + 1}`,
      sortOrder: row.sort_order ?? index,
      isComingSoon: Boolean(row.is_coming_soon),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function mapDbLessons(rows: DbLesson[], locale: "ar" | "en"): CurriculumLesson[] {
  return [...rows]
    .map((row, index) => ({
      id: row.id,
      unitId: row.unit_id,
      title: localizedTitle(locale, row) || `Lesson ${index + 1}`,
      sortOrder: row.sort_order ?? index,
      isComingSoon: Boolean(row.is_coming_soon),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function subjectCode(subject: string): string {
  const value = subject.toLowerCase();
  if (value.includes("math") || value.includes("رياض")) return "MA";
  if (value.includes("science") || value.includes("علوم")) return "SC";
  if (value.includes("english") || value.includes("إنجل")) return "EN";
  return "AR";
}

function playlistIdFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("list") || url;
  } catch {
    return url;
  }
}

function resourceVisual(resource: DbResource, locale: "ar" | "en", fallbackIcon: string) {
  const description =
    (locale === "en"
      ? resource.description_en || resource.description_ar
      : resource.description_ar || resource.description_en) ||
    resource.description ||
    "";
  return {
    description: description.trim(),
    coverImage: (resource.cover_image_url || resource.cover_image || "").trim(),
    cardColor: (resource.card_color || resource.badge_color || "#0f766e").trim() || "#0f766e",
    iconName: (resource.icon_name || resource.icon_type || fallbackIcon).trim() || fallbackIcon,
    category: (resource.resource_category || "").trim(),
    unitId: resource.unit_id || "",
    lessonId: resource.lesson_id || "",
    isComingSoon: Boolean(resource.is_coming_soon),
  };
}

export function mapDbResources(
  resources: DbResource[],
  grades: DbGrade[],
  locale: "ar" | "en",
): { notes: CatalogNote[]; lessons: CatalogLesson[] } {
  const byId = new Map<string, DbGrade>();
  for (const grade of grades) {
    byId.set(grade.id, grade);
    if (grade.slug) byId.set(grade.slug, grade);
  }
  const notes: CatalogNote[] = [];
  const lessons: CatalogLesson[] = [];

  for (const resource of resources) {
    if (!resource?.id || !resource.grade_id) continue;
    const grade = byId.get(resource.grade_id);
    if (!grade) continue;

    const stageId = grade.stage;
    if (!stageMeta[stageId]) continue;

    const gradeId = grade.slug || grade.id;
    const stageTitle = locale === "en" ? stageMeta[stageId].titleEn : stageMeta[stageId].titleAr;
    const gradeTitle = locale === "en" ? grade.title_en : grade.title_ar;
    const subjectTitle =
      (locale === "en" ? resource.subject_en : resource.subject_ar) ||
      resource.subject_ar ||
      resource.subject_en ||
      "";
    const title =
      (locale === "en" ? resource.title_en : resource.title_ar) ||
      resource.title_ar ||
      resource.title_en ||
      "Untitled";
    const code = subjectCode(subjectTitle);
    const type = String(resource.type || "").toLowerCase();
    const isPdf = type === "pdf" || type === "document" || type === "book" || type === "note";

    if (isPdf) {
      notes.push({
        id: resource.id,
        subjectId: `${gradeId}-${code.toLowerCase()}`,
        title,
        detail: resource.term ?? "",
        kind:
          title.includes("ورقة") || title.toLowerCase().includes("worksheet")
            ? "ورقة عمل"
            : "ملخص",
        fileUrl: resource.url || "",
        fileName: `${grade.slug || "note"}-${resource.id}.pdf`,
        subjectTitle,
        subjectCode: code,
        gradeId,
        gradeTitle,
        stageId,
        stageTitle,
        ...resourceVisual(resource, locale, "file-text"),
      });
    } else {
      const videoUrl = resource.url || "";
      lessons.push({
        id: resource.id,
        subjectId: `${gradeId}-${code.toLowerCase()}`,
        title,
        detail: resource.term ?? "",
        playlistId: playlistIdFromUrl(videoUrl),
        videoUrl,
        subjectTitle,
        subjectCode: code,
        gradeId,
        gradeTitle,
        stageId,
        stageTitle,
        ...resourceVisual(resource, locale, "play-circle"),
      });
    }
  }

  return { notes, lessons };
}

export function localCatalogSnapshot(locale: "ar" | "en") {
  const stages = locale === "en" ? stagesFromLocale("en") : listStages();
  return {
    stages,
    grades: listGrades(),
    notes: listCatalogNotes(),
    lessons: listCatalogLessons(),
    pulse: listPulse(),
  };
}

export function pulseFrom(counts: { stages: number; grades: number; notes: number; playlists: number }): PlatformPulse {
  return counts;
}

export { listStages };
