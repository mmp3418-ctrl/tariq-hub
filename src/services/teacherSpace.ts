import { normalizeExternalHref, normalizeMediaHref } from "../lib/contactLinks.ts";
import { isSupabaseConfigured, supabase } from "../lib/supabase.ts";

export type TeacherTutorialView = {
  id: string;
  title: string;
  youtubeUrl: string;
  coverImageUrl: string;
  stageId: string;
  gradeId: string;
};

export type TeacherReferenceView = {
  id: string;
  title: string;
  fileUrl: string;
  stageId: string;
  gradeId: string;
};

export type QuestionBankView = {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "a" | "b" | "c" | "d";
  stageId: string;
  gradeId: string;
};

export type TeacherSpaceBundle = {
  tutorials: TeacherTutorialView[];
  references: TeacherReferenceView[];
  questions: QuestionBankView[];
  gradeCalculatorActive: boolean;
  source: "supabase" | "empty";
};

function active(row: { is_active?: boolean | null }) {
  return row.is_active !== false;
}

function mediaUrl(...candidates: Array<string | null | undefined>) {
  for (const c of candidates) {
    const raw = String(c ?? "").trim();
    if (!raw) continue;
    const href = normalizeMediaHref(raw) || normalizeExternalHref(raw);
    if (href) return href;
  }
  return "";
}

async function selectActive<T>(table: string): Promise<T[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`[tariq] ${table}:`, error.message, error);
      if (/is_active/i.test(error.message)) {
        const legacy = await supabase.from(table).select("*");
        if (legacy.error) {
          console.error(`[tariq] ${table} legacy:`, legacy.error.message);
          return [];
        }
        return ((legacy.data as T[] | null) ?? []).filter((r) =>
          active(r as { is_active?: boolean | null }),
        );
      }
      return [];
    }
    return (data as T[] | null) ?? [];
  } catch (err) {
    console.error(`[tariq] ${table} exception:`, err);
    return [];
  }
}

export async function fetchTeacherSpaceBundle(): Promise<TeacherSpaceBundle> {
  const empty: TeacherSpaceBundle = {
    tutorials: [],
    references: [],
    questions: [],
    gradeCalculatorActive: false,
    source: "empty",
  };

  if (!supabase || !isSupabaseConfigured) {
    console.warn("[tariq] teacher space: Supabase not configured");
    return empty;
  }

  const [tutorialsRaw, referencesRaw, questionsRaw, settingsRes] =
    await Promise.all([
      selectActive<Record<string, unknown>>("teacher_tutorials"),
      selectActive<Record<string, unknown>>("teacher_references"),
      selectActive<Record<string, unknown>>("question_bank"),
      supabase.from("teacher_space_settings").select("*").eq("id", 1).maybeSingle(),
    ]);

  if (settingsRes.error) {
    console.error("[tariq] teacher_space_settings:", settingsRes.error.message);
  }

  const gradeCalculatorActive =
    settingsRes.data == null
      ? true
      : (settingsRes.data as { grade_calculator_active?: boolean }).grade_calculator_active !==
        false;

  const tutorials: TeacherTutorialView[] = tutorialsRaw
    .filter(active)
    .map((row) => ({
      id: String(row.id),
      title: String(row.title ?? "").trim() || "شرح",
      youtubeUrl: normalizeExternalHref(String(row.youtube_url ?? "")) || "",
      coverImageUrl: mediaUrl(row.cover_image_url as string),
      stageId: row.stage_id ? String(row.stage_id) : "",
      gradeId: row.grade_id ? String(row.grade_id) : "",
    }))
    .filter((item) => Boolean(item.youtubeUrl));

  const references: TeacherReferenceView[] = referencesRaw
    .filter(active)
    .map((row) => ({
      id: String(row.id),
      title: String(row.title ?? "").trim() || "مرجع",
      fileUrl: mediaUrl(row.file_url as string),
      stageId: row.stage_id ? String(row.stage_id) : "",
      gradeId: row.grade_id ? String(row.grade_id) : "",
    }))
    .filter((item) => Boolean(item.fileUrl));

  const questions: QuestionBankView[] = questionsRaw
    .filter(active)
    .map((row) => {
      let optionA = String(row.option_a ?? "").trim();
      let optionB = String(row.option_b ?? "").trim();
      let optionC = String(row.option_c ?? "").trim();
      let optionD = String(row.option_d ?? "").trim();
      let correctAnswer: "a" | "b" | "c" | "d" = "a";

      const opts = Array.isArray(row.options)
        ? (row.options as unknown[]).map((x) => String(x ?? "").trim())
        : [];
      if (opts.length > 0) {
        optionA = opts[0] || optionA;
        optionB = opts[1] || optionB;
        optionC = opts[2] || optionC;
        optionD = opts[3] || optionD;
        const idx = Number(row.correct_index ?? 0);
        correctAnswer = (["a", "b", "c", "d"] as const)[Math.min(Math.max(idx, 0), 3)];
      } else {
        const ans = String(row.correct_answer ?? "a").toLowerCase();
        correctAnswer =
          ans === "b" || ans === "c" || ans === "d" ? ans : "a";
      }

      return {
        id: String(row.id),
        questionText: String(row.question_text ?? "").trim(),
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        stageId: row.stage_id ? String(row.stage_id) : "",
        gradeId: row.grade_id ? String(row.grade_id) : "",
      };
    })
    .filter((item) => Boolean(item.questionText));

  console.info("[tariq] teacher space bundle:", {
    tutorials: tutorials.length,
    references: references.length,
    questions: questions.length,
    gradeCalculatorActive,
  });

  const hasData =
    tutorials.length > 0 ||
    references.length > 0 ||
    questions.length > 0 ||
    settingsRes.data != null;

  return {
    tutorials,
    references,
    questions,
    gradeCalculatorActive,
    source: hasData ? "supabase" : "empty",
  };
}
