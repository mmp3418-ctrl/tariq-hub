import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchActiveClassSchedules,
  fetchActiveTeacherSchedules,
  fetchGradeCalculatorTools,
  fetchTeacherResources,
  isRowComingSoon,
  isSupabaseConfigured,
  supabase,
  type DbClassSchedule,
  type DbGradeCalculatorTool,
  type DbTeacherResource,
  type DbTeacherSchedule,
} from "../lib/supabase.ts";

export type TeacherPortalSection = "resources" | "schedules" | "calculator";

type TeacherPortalValue = {
  ready: boolean;
  resources: DbTeacherResource[];
  calculatorTools: DbGradeCalculatorTool[];
  teacherSchedules: DbTeacherSchedule[];
  classSchedules: DbClassSchedule[];
  /** Published schedules with is_active — hidden when none. */
  schedulesVisible: boolean;
  /** Grade calculator respects is_active — hidden when all tools disabled. */
  calculatorVisible: boolean;
  /** Active tools exist but all are marked coming soon. */
  calculatorLocked: boolean;
  refresh: () => Promise<void>;
};

const TeacherPortalContext = createContext<TeacherPortalValue | null>(null);

export function TeacherPortalProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [resources, setResources] = useState<DbTeacherResource[]>([]);
  const [calculatorTools, setCalculatorTools] = useState<DbGradeCalculatorTool[]>([]);
  const [calculatorConfigured, setCalculatorConfigured] = useState(false);
  const [teacherSchedules, setTeacherSchedules] = useState<DbTeacherSchedule[]>([]);
  const [classSchedules, setClassSchedules] = useState<DbClassSchedule[]>([]);

  const applyCalculator = useCallback((result: Awaited<ReturnType<typeof fetchGradeCalculatorTools>>) => {
    if (!result) return;
    setCalculatorConfigured(result.configured);
    setCalculatorTools(result.active);
  }, []);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
    try {
      const [res, tools, teachers, classes] = await Promise.all([
        fetchTeacherResources(),
        fetchGradeCalculatorTools(),
        fetchActiveTeacherSchedules(),
        fetchActiveClassSchedules(),
      ]);
      if (res) setResources(res);
      applyCalculator(tools);
      if (teachers) setTeacherSchedules(teachers);
      if (classes) setClassSchedules(classes);
    } catch (err) {
      console.warn("[tariq] TeacherPortalProvider refresh:", err);
    } finally {
      setReady(true);
    }
  }, [applyCalculator]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const channel = client
      .channel("tariq-teacher-portal")
      .on("postgres_changes", { event: "*", schema: "public", table: "teacher_resources" }, () => {
        void fetchTeacherResources().then((rows) => {
          if (rows) setResources(rows);
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "teacher_space_items" }, () => {
        void fetchTeacherResources().then((rows) => {
          if (rows) setResources(rows);
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "grade_calculator_tools" }, () => {
        void fetchGradeCalculatorTools().then(applyCalculator);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "teacher_schedules" }, () => {
        void fetchActiveTeacherSchedules().then((rows) => {
          if (rows) setTeacherSchedules(rows);
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "class_schedules" }, () => {
        void fetchActiveClassSchedules().then((rows) => {
          if (rows) setClassSchedules(rows);
        });
      })
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [applyCalculator]);

  const value = useMemo<TeacherPortalValue>(() => {
    const schedulesVisible = teacherSchedules.length > 0 || classSchedules.length > 0;
    // Empty tools table → built-in calculator stays available.
    // Configured but every tool inactive → hide calculator.
    const calculatorVisible = !calculatorConfigured || calculatorTools.length > 0;
    const calculatorLocked =
      calculatorVisible &&
      calculatorTools.length > 0 &&
      calculatorTools.every((tool) => isRowComingSoon(tool));

    return {
      ready,
      resources,
      calculatorTools,
      teacherSchedules,
      classSchedules,
      schedulesVisible,
      calculatorVisible,
      calculatorLocked,
      refresh,
    };
  }, [
    calculatorConfigured,
    calculatorTools,
    classSchedules,
    ready,
    refresh,
    resources,
    teacherSchedules,
  ]);

  return <TeacherPortalContext.Provider value={value}>{children}</TeacherPortalContext.Provider>;
}

export function useTeacherPortal() {
  const ctx = useContext(TeacherPortalContext);
  if (!ctx) throw new Error("useTeacherPortal must be used within TeacherPortalProvider");
  return ctx;
}
