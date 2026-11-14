import type { DbGrade, DbResource } from "../lib/supabase.ts";
import {
  listCatalogLessons,
  listCatalogNotes,
  listGrades,
  listPulse,
  listStages,
} from "./curriculum.ts";
import type { CatalogLesson, CatalogNote, Grade, PlatformPulse, Stage, StageId } from "./types.ts";

const stageMeta: Record<StageId, { index: string; kickerAr: string; kickerEn: string; titleAr: string; titleEn: string; summaryAr: string; summaryEn: string }> = {
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
      stageId: row.stage,
      index: String(index + 1).padStart(2, "0"),
      title: locale === "en" ? row.title_en : row.title_ar,
      subtitle: locale === "en" ? stageMeta[row.stage].titleEn : stageMeta[row.stage].titleAr,
    }));
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

export function mapDbResources(
  resources: DbResource[],
  grades: DbGrade[],
  locale: "ar" | "en",
): { notes: CatalogNote[]; lessons: CatalogLesson[] } {
  const byId = new Map(grades.map((grade) => [grade.id, grade]));
  const notes: CatalogNote[] = [];
  const lessons: CatalogLesson[] = [];

  for (const resource of resources) {
    const grade = byId.get(resource.grade_id);
    if (!grade) continue;
    const gradeId = grade.slug || grade.id;
    const stageId = grade.stage;
    const stageTitle = locale === "en" ? stageMeta[stageId].titleEn : stageMeta[stageId].titleAr;
    const gradeTitle = locale === "en" ? grade.title_en : grade.title_ar;
    const subjectTitle = locale === "en" ? resource.subject_en : resource.subject_ar;
    const title = locale === "en" ? resource.title_en : resource.title_ar;
    const code = subjectCode(subjectTitle);

    if (resource.type === "pdf") {
      notes.push({
        id: resource.id,
        subjectId: `${gradeId}-${code.toLowerCase()}`,
        title,
        detail: resource.term ?? "",
        kind: title.includes("ورقة") || title.toLowerCase().includes("worksheet") ? "ورقة عمل" : "ملخص",
        fileUrl: resource.url,
        fileName: `${grade.slug || "note"}.pdf`,
        subjectTitle,
        subjectCode: code,
        gradeId,
        gradeTitle,
        stageId,
        stageTitle,
      });
    } else {
      lessons.push({
        id: resource.id,
        subjectId: `${gradeId}-${code.toLowerCase()}`,
        title,
        detail: resource.term ?? "",
        playlistId: playlistIdFromUrl(resource.url),
        subjectTitle,
        subjectCode: code,
        gradeId,
        gradeTitle,
        stageId,
        stageTitle,
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
