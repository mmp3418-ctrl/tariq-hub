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

export type Database = {
  public: {
    Tables: {
      announcements: { Row: DbAnnouncement; Insert: Partial<DbAnnouncement>; Update: Partial<DbAnnouncement> };
      grades: { Row: DbGrade; Insert: Partial<DbGrade>; Update: Partial<DbGrade> };
      resources: { Row: DbResource; Insert: Partial<DbResource>; Update: Partial<DbResource> };
    };
  };
};

const env = import.meta.env as Record<string, string | undefined>;

const supabaseUrl =
  env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  env.VITE_SUPABASE_URL?.trim() ||
  "";

const supabaseAnonKey =
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  env.VITE_SUPABASE_ANON_KEY?.trim() ||
  "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { params: { eventsPerSecond: 8 } },
    })
  : null;

/** Realistic Libyan-curriculum mock used when keys are missing or requests fail. */
export const mockAnnouncements: DbAnnouncement[] = [
  {
    id: "ann-welcome",
    message_ar: "منصة طارق Hub جاهزة للدراسة — اختر مرحلتك وابدأ من صفّك مباشرة.",
    message_en: "Tariq Hub is ready — pick your stage and open your grade workspace.",
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
