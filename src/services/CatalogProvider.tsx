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
  fetchRemoteAnnouncements,
  fetchRemoteGrades,
  fetchRemoteLessons,
  fetchRemoteResources,
  fetchRemoteUnits,
  isSupabaseConfigured,
  mockAnnouncements,
  mockDbGrades,
  mockDbResources,
  supabase,
  type DbAnnouncement,
  type DbGrade,
  type DbLesson,
  type DbResource,
  type DbUnit,
} from "../lib/supabase.ts";
import { usePreferences } from "../lib/preferences.tsx";
import {
  localCatalogSnapshot,
  mapDbGrades,
  mapDbLessons,
  mapDbResources,
  mapDbUnits,
  pulseFrom,
  stagesFromLocale,
} from "./catalogMap.ts";
import type {
  CatalogLesson,
  CatalogNote,
  CurriculumLesson,
  CurriculumUnit,
  Grade,
  PlatformPulse,
  Stage,
  StageId,
  Subject,
} from "./types.ts";

export type Announcement = DbAnnouncement;

type CatalogContextValue = {
  source: "mock" | "supabase";
  ready: boolean;
  stages: Stage[];
  grades: Grade[];
  units: CurriculumUnit[];
  curriculumLessons: CurriculumLesson[];
  notes: CatalogNote[];
  lessons: CatalogLesson[];
  announcements: Announcement[];
  pulse: PlatformPulse;
  gradesByStage: (stageId: string) => Grade[];
  gradeById: (gradeId: string) => Grade | undefined;
  unitsByGrade: (gradeId: string) => CurriculumUnit[];
  lessonsByUnit: (unitId: string) => CurriculumLesson[];
  subjectsByGrade: (gradeId: string) => Subject[];
  notesByGrade: (gradeId: string) => CatalogNote[];
  lessonsByGrade: (gradeId: string) => CatalogLesson[];
  notesByLesson: (lessonId: string) => CatalogNote[];
  playlistsByLesson: (lessonId: string) => CatalogLesson[];
  notesByUnit: (unitId: string) => CatalogNote[];
  playlistsByUnit: (unitId: string) => CatalogLesson[];
  refresh: () => Promise<void>;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

function subjectsFromNotesAndLessons(gradeId: string, notes: CatalogNote[], lessons: CatalogLesson[]): Subject[] {
  const map = new Map<string, Subject>();
  for (const item of [...notes, ...lessons].filter((entry) => entry.gradeId === gradeId)) {
    if (map.has(item.subjectId)) continue;
    map.set(item.subjectId, {
      id: item.subjectId,
      gradeId,
      code: item.subjectCode,
      title: item.subjectTitle,
      focus: item.detail || item.subjectTitle,
    });
  }
  return [...map.values()];
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const { locale } = usePreferences();
  const local = useMemo(() => localCatalogSnapshot(locale), [locale]);

  const [ready, setReady] = useState(false);
  const [source, setSource] = useState<"mock" | "supabase">("mock");
  const [dbGrades, setDbGrades] = useState<DbGrade[] | null>(null);
  const [dbResources, setDbResources] = useState<DbResource[] | null>(null);
  const [dbUnits, setDbUnits] = useState<DbUnit[]>([]);
  const [dbLessons, setDbLessons] = useState<DbLesson[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements.filter((item) => item.is_active));

  const hydrate = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setDbGrades(null);
      setDbResources(null);
      setDbUnits([]);
      setDbLessons([]);
      setAnnouncements(mockAnnouncements.filter((item) => item.is_active));
      setSource("mock");
      setReady(true);
      return;
    }

    const [grades, resources, active, units, lessons] = await Promise.all([
      fetchRemoteGrades(),
      fetchRemoteResources(),
      fetchRemoteAnnouncements(),
      fetchRemoteUnits(),
      fetchRemoteLessons(),
    ]);

    if (grades !== null) {
      setDbGrades(grades);
      setDbResources(resources ?? []);
      setSource("supabase");
    } else {
      setDbGrades(mockDbGrades);
      setDbResources(mockDbResources);
      setSource("mock");
    }

    setDbUnits(units ?? []);
    setDbLessons(lessons ?? []);

    if (active !== null) setAnnouncements(active);
    else setAnnouncements(mockAnnouncements.filter((item) => item.is_active));

    setReady(true);
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const channel = client
      .channel("tariq-catalog")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () => {
        void fetchRemoteAnnouncements().then((rows) => {
          if (rows) setAnnouncements(rows.filter((item) => item.is_active));
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "grades" }, () => {
        void fetchRemoteGrades().then((rows) => {
          if (rows !== null) {
            setDbGrades(rows);
            setSource("supabase");
          }
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "resources" }, () => {
        void fetchRemoteResources().then((rows) => {
          if (rows !== null) {
            setDbResources(rows);
            setSource("supabase");
          }
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "units" }, () => {
        void fetchRemoteUnits().then((rows) => {
          if (rows !== null) setDbUnits(rows);
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "lessons" }, () => {
        void fetchRemoteLessons().then((rows) => {
          if (rows !== null) setDbLessons(rows);
        });
      })
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, []);

  const stages = useMemo(() => (locale === "en" ? stagesFromLocale("en") : local.stages), [locale, local.stages]);

  const grades = useMemo(() => {
    if (!dbGrades) return local.grades;
    return mapDbGrades(dbGrades, locale);
  }, [dbGrades, locale, local.grades]);

  const units = useMemo(() => mapDbUnits(dbUnits, locale, grades), [dbUnits, grades, locale]);
  const curriculumLessons = useMemo(() => mapDbLessons(dbLessons, locale), [dbLessons, locale]);

  const mapped = useMemo(() => {
    if (!dbGrades || !dbResources) {
      return { notes: local.notes, lessons: local.lessons };
    }
    return mapDbResources(dbResources, dbGrades, locale);
  }, [dbGrades, dbResources, locale, local.lessons, local.notes]);

  const pulse = useMemo(
    () =>
      pulseFrom({
        stages: stages.length,
        grades: grades.length,
        notes: mapped.notes.length,
        playlists: mapped.lessons.length,
      }),
    [grades.length, mapped.lessons.length, mapped.notes.length, stages.length],
  );

  const value = useMemo<CatalogContextValue>(
    () => ({
      source,
      ready,
      stages,
      grades,
      units,
      curriculumLessons,
      notes: mapped.notes,
      lessons: mapped.lessons,
      announcements,
      pulse,
      gradesByStage: (stageId: string) => grades.filter((grade) => grade.stageId === (stageId as StageId)),
      gradeById: (gradeId: string) => grades.find((grade) => grade.id === gradeId || grade.dbId === gradeId),
      unitsByGrade: (gradeId: string) => units.filter((unit) => unit.gradeId === gradeId),
      lessonsByUnit: (unitId: string) => curriculumLessons.filter((lesson) => lesson.unitId === unitId),
      subjectsByGrade: (gradeId: string) => subjectsFromNotesAndLessons(gradeId, mapped.notes, mapped.lessons),
      notesByGrade: (gradeId: string) => mapped.notes.filter((note) => note.gradeId === gradeId),
      lessonsByGrade: (gradeId: string) => mapped.lessons.filter((lesson) => lesson.gradeId === gradeId),
      notesByLesson: (lessonId: string) => mapped.notes.filter((note) => note.lessonId === lessonId),
      playlistsByLesson: (lessonId: string) => mapped.lessons.filter((lesson) => lesson.lessonId === lessonId),
      // All materials linked to the unit (including lesson-scoped rows).
      notesByUnit: (unitId: string) => mapped.notes.filter((note) => note.unitId === unitId),
      playlistsByUnit: (unitId: string) =>
        mapped.lessons.filter((lesson) => lesson.unitId === unitId),
      refresh: hydrate,
    }),
    [
      announcements,
      curriculumLessons,
      grades,
      hydrate,
      mapped.lessons,
      mapped.notes,
      pulse,
      ready,
      source,
      stages,
      units,
    ],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalogStore() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalogStore must be used within CatalogProvider");
  return ctx;
}
