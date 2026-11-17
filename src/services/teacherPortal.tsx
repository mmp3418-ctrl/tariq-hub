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
  /** True when at least one published teacher/class schedule slot is active. */
  schedulesVisible: boolean;
  /** True when every calculator tool is coming soon (and at least one exists). */
  calculatorLocked: boolean;
  refresh: () => Promise<void>;
};

const TeacherPortalContext = createContext<TeacherPortalValue | null>(null);

export function TeacherPortalProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [resources, setResources] = useState<DbTeacherResource[]>([]);
  const [calculatorTools, setCalculatorTools] = useState<DbGradeCalculatorTool[]>([]);
  const [teacherSchedules, setTeacherSchedules] = useState<DbTeacherSchedule[]>([]);
  const [classSchedules, setClassSchedules] = useState<DbClassSchedule[]>([]);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
    const [res, tools, teachers, classes] = await Promise.all([
      fetchTeacherResources(),
      fetchGradeCalculatorTools(),
      fetchActiveTeacherSchedules(),
      fetchActiveClassSchedules(),
    ]);
    if (res) setResources(res);
    if (tools) setCalculatorTools(tools);
    if (teachers) setTeacherSchedules(teachers);
    if (classes) setClassSchedules(classes);
    setReady(true);
  }, []);

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
        void fetchGradeCalculatorTools().then((rows) => {
          if (rows) setCalculatorTools(rows);
        });
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
  }, []);

  const value = useMemo<TeacherPortalValue>(() => {
    const schedulesVisible = teacherSchedules.length > 0 || classSchedules.length > 0;
    const calculatorLocked =
      calculatorTools.length > 0 && calculatorTools.every((tool) => isRowComingSoon(tool));

    return {
      ready,
      resources,
      calculatorTools,
      teacherSchedules,
      classSchedules,
      schedulesVisible,
      calculatorLocked,
      refresh,
    };
  }, [calculatorTools, classSchedules, ready, refresh, resources, teacherSchedules]);

  return <TeacherPortalContext.Provider value={value}>{children}</TeacherPortalContext.Provider>;
}

export function useTeacherPortal() {
  const ctx = useContext(TeacherPortalContext);
  if (!ctx) throw new Error("useTeacherPortal must be used within TeacherPortalProvider");
  return ctx;
}
