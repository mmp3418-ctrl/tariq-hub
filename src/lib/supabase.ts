import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { StageId } from "../services/types.ts";

export type DbAnnouncement = {
  id: string;
  message_ar: string;
  message_en: string;
  is_active: boolean;
  created_at: string;
};

export type DbGrade = {
  id: string;
  stage: StageId;
  title_ar: string;
  title_en: string;
  slug: string;
  sort_order: number;
};

export type DbResource = {
  id: string;
  grade_id: string;
  type: "pdf" | "playlist";
  title_ar: string;
  title_en: string;
  subject_ar: string;
  subject_en: string;
  term: string | null;
  url: string;
  created_at: string;
};

export type DbSocialLink = {
  platform?: string;
  id?: string;
  url?: string;
  href?: string;
  label?: string;
  handle?: string;
};

export type DbSiteSettings = {
  id: number;
  logo_url: string | null;
  phone_number: string | null;
  whatsapp_number: string | null;
  telegram_link: string | null;
  social_links: DbSocialLink[] | null;
  updated_at: string;
};

export type TeacherPlannerMap = Record<string, string>;

/** Live Supabase shape: one row per timetable cell. */
export type DbTeacherSchedule = {
  id: string;
  teacher_name: string;
  day_of_week: string;
  period_number: number;
  class_name: string;
  subject: string;
  created_at: string;
};

const env = import.meta.env as Record<string, string | undefined>;

/** Accepts raw URLs or accidental markdown links like [https://x](https://x). */
function cleanEnvValue(value: string | undefined) {
  const raw = value?.trim() ?? "";
  if (!raw) return "";
  const markdown = raw.match(/\((https?:\/\/[^)\s]+)\)/);
  if (markdown?.[1]) return markdown[1].trim();
  const bare = raw.match(/https?:\/\/[^\s\]]+/);
  if (bare?.[0] && raw.includes("[")) return bare[0].trim();
  return raw;
}

const supabaseUrl = cleanEnvValue(env.NEXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL);
const supabaseAnonKey = cleanEnvValue(env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { params: { eventsPerSecond: 8 } },
    })
  : null;

/** Realistic Libyan-curriculum mock used when keys are missing or requests fail. */
export const mockAnnouncements: DbAnnouncement[] = [
  {
    id: "ann-welcome",
    message_ar: "منصة طارق جاهزة للدراسة — اختر مرحلتك وابدأ من صفّك مباشرة.",
    message_en: "Tariq Platform is ready — pick your stage and open your grade workspace.",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "ann-library",
    message_ar: "المكتبة محدّثة بملخصات وأوراق عمل تجريبية لكل مرحلة.",
    message_en: "The library includes sample notes and worksheets for every stage.",
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const mockDbGrades: DbGrade[] = [
  { id: "g-p1", stage: "primary", title_ar: "الصف الأول", title_en: "Grade 1", slug: "primary-1", sort_order: 1 },
  { id: "g-p2", stage: "primary", title_ar: "الصف الثاني", title_en: "Grade 2", slug: "primary-2", sort_order: 2 },
  { id: "g-p3", stage: "primary", title_ar: "الصف الثالث", title_en: "Grade 3", slug: "primary-3", sort_order: 3 },
  { id: "g-p4", stage: "primary", title_ar: "الصف الرابع", title_en: "Grade 4", slug: "primary-4", sort_order: 4 },
  { id: "g-p5", stage: "primary", title_ar: "الصف الخامس", title_en: "Grade 5", slug: "primary-5", sort_order: 5 },
  { id: "g-p6", stage: "primary", title_ar: "الصف السادس", title_en: "Grade 6", slug: "primary-6", sort_order: 6 },
  { id: "g-pr1", stage: "preparatory", title_ar: "أول إعدادي", title_en: "7th grade", slug: "prep-1", sort_order: 7 },
  { id: "g-pr2", stage: "preparatory", title_ar: "ثاني إعدادي", title_en: "8th grade", slug: "prep-2", sort_order: 8 },
  { id: "g-pr3", stage: "preparatory", title_ar: "ثالث إعدادي", title_en: "9th grade", slug: "prep-3", sort_order: 9 },
  { id: "g-s1", stage: "secondary", title_ar: "صف أول ثانوي", title_en: "1st secondary", slug: "sec-1", sort_order: 10 },
  { id: "g-s2s", stage: "secondary", title_ar: "صف ثاني ثانوي علمي", title_en: "2nd secondary · Science", slug: "sec-2-science", sort_order: 11 },
  { id: "g-s2a", stage: "secondary", title_ar: "صف ثاني ثانوي أدبي", title_en: "2nd secondary · Arts", slug: "sec-2-arts", sort_order: 12 },
  { id: "g-s3s", stage: "secondary", title_ar: "صف ثالث ثانوي علمي", title_en: "3rd secondary · Science", slug: "sec-3-science", sort_order: 13 },
  { id: "g-s3a", stage: "secondary", title_ar: "صف ثالث ثانوي أدبي", title_en: "3rd secondary · Arts", slug: "sec-3-arts", sort_order: 14 },
];

const SAMPLE_NOTE = "/notes/sample-note.pdf";
const SAMPLE_PLAYLIST = "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab";

export const mockDbResources: DbResource[] = mockDbGrades.flatMap((grade, index) => {
  const science = grade.slug.includes("science");
  const arts = grade.slug.includes("arts");
  const subject_ar = science ? "الرياضيات" : arts ? "اللغة العربية" : grade.stage === "preparatory" ? "العلوم" : "اللغة العربية";
  const subject_en = science ? "Mathematics" : arts ? "Arabic" : grade.stage === "preparatory" ? "Science" : "Arabic";
  const term = index % 2 === 0 ? "الفصل الأول" : "الفصل الثاني";
  return [
    {
      id: `res-pdf-${grade.slug}`,
      grade_id: grade.id,
      type: "pdf" as const,
      title_ar: `ملخص ${subject_ar}`,
      title_en: `${subject_en} summary`,
      subject_ar,
      subject_en,
      term,
      url: SAMPLE_NOTE,
      created_at: new Date().toISOString(),
    },
    {
      id: `res-pl-${grade.slug}`,
      grade_id: grade.id,
      type: "playlist" as const,
      title_ar: `شرح ${subject_ar}`,
      title_en: `${subject_en} playlist`,
      subject_ar,
      subject_en,
      term,
      url: SAMPLE_PLAYLIST,
      created_at: new Date().toISOString(),
    },
  ];
});

export async function fetchRemoteAnnouncements(): Promise<DbAnnouncement[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[tariq] announcements fallback:", error.message);
    return null;
  }
  return data ?? [];
}

export async function fetchRemoteGrades(): Promise<DbGrade[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("grades").select("*").order("sort_order", { ascending: true });
  if (error) {
    console.warn("[tariq] grades fallback:", error.message);
    return null;
  }
  return data ?? [];
}

export async function fetchRemoteResources(): Promise<DbResource[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("resources").select("*").order("created_at", { ascending: false });
  if (error) {
    console.warn("[tariq] resources fallback:", error.message);
    return null;
  }
  return data ?? [];
}

export const defaultSiteSettings: DbSiteSettings = {
  id: 0,
  logo_url: "",
  phone_number: "",
  whatsapp_number: "",
  telegram_link: "",
  social_links: [],
  updated_at: new Date().toISOString(),
};

export async function fetchSiteSettings(): Promise<DbSiteSettings | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("site_settings").select("*").order("id", { ascending: true }).limit(1).maybeSingle();
  if (error) {
    console.warn("[tariq] site_settings fallback:", error.message);
    return null;
  }
  return (data as DbSiteSettings | null) ?? null;
}

function plannerKey(dayIndex: number | string, period: number | string) {
  return `${dayIndex}-${period}`;
}

function rowsToPlanner(rows: DbTeacherSchedule[]): TeacherPlannerMap {
  const next: TeacherPlannerMap = {};
  for (const row of rows) {
    const day = String(row.day_of_week);
    const period = String(row.period_number);
    const subject = (row.subject ?? "").trim();
    const className = (row.class_name ?? "").trim();
    if (!subject && (!className || className === "—")) continue;
    next[plannerKey(day, period)] =
      className && className !== "—" && className !== subject ? `${subject} / ${className}` : subject || className;
  }
  return next;
}

function plannerToRows(teacherName: string, planner: TeacherPlannerMap): Omit<DbTeacherSchedule, "id" | "created_at">[] {
  const rows: Omit<DbTeacherSchedule, "id" | "created_at">[] = [];
  for (const [key, raw] of Object.entries(planner)) {
    const value = raw.trim();
    if (!value) continue;
    const [dayRaw, periodRaw] = key.split("-");
    const period_number = Number(periodRaw);
    if (!dayRaw || !Number.isFinite(period_number)) continue;
    const [subjectPart, classPart] = value.split("/").map((part) => part.trim());
    rows.push({
      teacher_name: teacherName,
      day_of_week: String(dayRaw),
      period_number,
      subject: subjectPart || value,
      class_name: classPart || "—",
    });
  }
  return rows;
}

export async function fetchTeacherSchedule(teacherName: string): Promise<TeacherPlannerMap | null> {
  if (!supabase || !teacherName) return null;
  const { data, error } = await supabase
    .from("teacher_schedules")
    .select("*")
    .eq("teacher_name", teacherName)
    .order("day_of_week", { ascending: true })
    .order("period_number", { ascending: true });
  if (error) {
    console.warn("[tariq] teacher_schedules fallback:", error.message);
    return null;
  }
  return rowsToPlanner((data as DbTeacherSchedule[] | null) ?? []);
}

export async function upsertTeacherSchedule(teacherName: string, planner: TeacherPlannerMap): Promise<boolean> {
  if (!supabase || !teacherName) return false;

  const { error: deleteError } = await supabase.from("teacher_schedules").delete().eq("teacher_name", teacherName);
  if (deleteError) {
    console.warn("[tariq] teacher_schedules clear fallback:", deleteError.message);
    return false;
  }

  const rows = plannerToRows(teacherName, planner);
  if (rows.length === 0) return true;

  const { error } = await supabase.from("teacher_schedules").insert(rows);
  if (error) {
    console.warn("[tariq] teacher_schedules save fallback:", error.message);
    return false;
  }
  return true;
}

export const TEACHER_DEVICE_KEY = "tariq-teacher-device-id";

export function getTeacherDeviceId(): string {
  if (typeof window === "undefined") return "server";
  try {
    const existing = localStorage.getItem(TEACHER_DEVICE_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    localStorage.setItem(TEACHER_DEVICE_KEY, created);
    return created;
  } catch {
    return "local-fallback";
  }
}

/** Stable owner key stored in live teacher_schedules.teacher_name */
export function getTeacherScheduleOwner(): string {
  return `tariq:${getTeacherDeviceId()}`;
}
