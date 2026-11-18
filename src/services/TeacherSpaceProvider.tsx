import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase.ts";
import {
  fetchTeacherSpaceBundle,
  type QuestionBankView,
  type TeacherReferenceView,
  type TeacherSpaceBundle,
  type TeacherTimetableView,
  type TeacherTutorialView,
} from "./teacherSpace.ts";
import { useAcademicCatalog } from "./AcademicCatalogProvider.tsx";

export type TeacherSpaceSection =
  | "timetable"
  | "tutorials"
  | "references"
  | "questions"
  | "calculator";

type TeacherSpaceValue = {
  ready: boolean;
  gradeCalculatorActive: boolean;
  siteTimetableActive: boolean;
  timetables: TeacherTimetableView[];
  tutorials: TeacherTutorialView[];
  references: TeacherReferenceView[];
  questions: QuestionBankView[];
  timetablesByGrade: (gradeId: string) => TeacherTimetableView[];
  tutorialsByGrade: (gradeId: string) => TeacherTutorialView[];
  referencesByGrade: (gradeId: string) => TeacherReferenceView[];
  questionsByGrade: (gradeId: string) => QuestionBankView[];
  stageName: (stageId: string) => string;
  gradeName: (gradeId: string) => string;
  refresh: () => Promise<void>;
};

const EMPTY: TeacherSpaceBundle = {
  timetables: [],
  tutorials: [],
  references: [],
  questions: [],
  gradeCalculatorActive: true,
  siteTimetableActive: true,
  source: "empty",
};

const TeacherSpaceContext = createContext<TeacherSpaceValue | null>(null);

export function TeacherSpaceProvider({ children }: { children: ReactNode }) {
  const { stages, grades } = useAcademicCatalog();
  const [bundle, setBundle] = useState<TeacherSpaceBundle>(EMPTY);
  const [ready, setReady] = useState(false);

  const hydrate = useCallback(async () => {
    try {
      const next = await fetchTeacherSpaceBundle();
      setBundle(next);
    } catch (err) {
      console.error("[tariq] TeacherSpaceProvider hydrate:", err);
      setBundle(EMPTY);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const onFocus = () => void hydrate();
    const onVisible = () => {
      if (document.visibilityState === "visible") void hydrate();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [hydrate]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void hydrate();
    }, 10_000);
    return () => window.clearInterval(id);
  }, [hydrate]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const refresh = () => void hydrate();
    const channel = client
      .channel(`tariq-teacher-space-${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "teacher_timetables" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "teacher_tutorials" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "teacher_references" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "question_bank" }, refresh)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teacher_space_settings" },
        refresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_timetable_status" },
        refresh,
      )
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, [hydrate]);

  const stageMap = useMemo(
    () => new Map((stages ?? []).map((s) => [s.id, s.name])),
    [stages],
  );
  const gradeMap = useMemo(
    () => new Map((grades ?? []).map((g) => [g.id, g.name])),
    [grades],
  );

  const value = useMemo<TeacherSpaceValue>(() => {
    const timetables = Array.isArray(bundle.timetables) ? bundle.timetables : [];
    const tutorials = Array.isArray(bundle.tutorials) ? bundle.tutorials : [];
    const references = Array.isArray(bundle.references) ? bundle.references : [];
    const questions = Array.isArray(bundle.questions) ? bundle.questions : [];
    return {
      ready,
      gradeCalculatorActive: bundle.gradeCalculatorActive,
      siteTimetableActive: bundle.siteTimetableActive,
      timetables,
      tutorials,
      references,
      questions,
      timetablesByGrade: (gradeId) =>
        gradeId ? timetables.filter((t) => t.gradeId === gradeId) : timetables,
      tutorialsByGrade: (gradeId) =>
        gradeId ? tutorials.filter((t) => t.gradeId === gradeId) : tutorials,
      referencesByGrade: (gradeId) =>
        gradeId ? references.filter((t) => t.gradeId === gradeId) : references,
      questionsByGrade: (gradeId) =>
        gradeId ? questions.filter((t) => t.gradeId === gradeId) : questions,
      stageName: (id) => (id ? stageMap.get(id) || "" : ""),
      gradeName: (id) => (id ? gradeMap.get(id) || "" : ""),
      refresh: hydrate,
    };
  }, [bundle, gradeMap, hydrate, ready, stageMap]);

  return (
    <TeacherSpaceContext.Provider value={value}>{children}</TeacherSpaceContext.Provider>
  );
}

export function useTeacherSpace() {
  const ctx = useContext(TeacherSpaceContext);
  if (!ctx) {
    console.error("useTeacherSpace must be used within TeacherSpaceProvider");
    return {
      ready: true,
      gradeCalculatorActive: false,
      siteTimetableActive: false,
      timetables: [],
      tutorials: [],
      references: [],
      questions: [],
      timetablesByGrade: () => [],
      tutorialsByGrade: () => [],
      referencesByGrade: () => [],
      questionsByGrade: () => [],
      stageName: () => "",
      gradeName: () => "",
      refresh: async () => undefined,
    } satisfies TeacherSpaceValue;
  }
  return ctx;
}
