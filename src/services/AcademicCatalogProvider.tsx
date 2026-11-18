import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  fetchAcademicBundle,
  type AcademicBundle,
  type AcademicGradeView,
  type AcademicStageView,
  type AcademicUnitView,
  type MaterialView,
  type PlaylistView,
} from "./academicCatalog.ts";
import { isSupabaseConfigured, supabase } from "../lib/supabase.ts";

type AcademicCatalogValue = {
  ready: boolean;
  source: "mock" | "supabase";
  stages: AcademicStageView[];
  grades: AcademicGradeView[];
  units: AcademicUnitView[];
  materials: MaterialView[];
  playlists: PlaylistView[];
  gradesByStage: (stageId: string) => AcademicGradeView[];
  unitsByGrade: (gradeId: string) => AcademicUnitView[];
  materialsByGrade: (gradeId: string) => MaterialView[];
  materialsByUnit: (unitIdOrName: string) => MaterialView[];
  playlistsByGrade: (gradeId: string) => PlaylistView[];
  playlistsByUnit: (unitIdOrName: string) => PlaylistView[];
  playlistsByStage: (stageId: string) => PlaylistView[];
  refresh: () => Promise<void>;
};

function matchesUnit(item: { unitId: string; unitName: string }, unitIdOrName: string) {
  if (!unitIdOrName) return false;
  if (item.unitId && item.unitId === unitIdOrName) return true;
  if (item.unitName && item.unitName === unitIdOrName) return true;
  // Typed unit synthetic ids: typed:{gradeId}:{encodedName}
  if (unitIdOrName.startsWith("typed:")) {
    const parts = unitIdOrName.split(":");
    const encoded = parts.slice(2).join(":");
    try {
      return item.unitName === decodeURIComponent(encoded);
    } catch {
      return item.unitName === encoded;
    }
  }
  return false;
}

const AcademicCatalogContext = createContext<AcademicCatalogValue | null>(null);

const EMPTY: AcademicBundle = {
  stages: [],
  grades: [],
  units: [],
  materials: [],
  playlists: [],
  source: "mock",
};

export function AcademicCatalogProvider({ children }: { children: ReactNode }) {
  const [bundle, setBundle] = useState<AcademicBundle>(EMPTY);
  const [ready, setReady] = useState(false);
  const hasLive = useRef(false);

  const hydrate = useCallback(async () => {
    try {
      const next = await fetchAcademicBundle();
      if (next.source === "supabase" || next.stages.length || next.materials.length || next.playlists.length) {
        setBundle(next);
        hasLive.current = true;
      } else if (!hasLive.current) {
        setBundle(EMPTY);
      }
    } catch (err) {
      console.error("[tariq] AcademicCatalogProvider hydrate:", err);
      if (!hasLive.current) setBundle(EMPTY);
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
    }, 12_000);
    return () => window.clearInterval(id);
  }, [hydrate]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const refresh = () => void hydrate();
    const channel = client
      .channel(`tariq-academic-${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "academic_stages" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "academic_grades" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "academic_units" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "educational_materials" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "video_playlists" }, refresh)
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, [hydrate]);

  const value = useMemo<AcademicCatalogValue>(() => {
    const { stages, grades, units, materials, playlists, source } = bundle;
    return {
      ready,
      source,
      stages,
      grades,
      units,
      materials,
      playlists,
      gradesByStage: (stageId) => grades.filter((g) => g.stageId === stageId),
      unitsByGrade: (gradeId) => units.filter((u) => u.gradeId === gradeId),
      materialsByGrade: (gradeId) => materials.filter((m) => m.gradeId === gradeId),
      materialsByUnit: (unitIdOrName) =>
        materials.filter((m) => matchesUnit(m, unitIdOrName)),
      playlistsByGrade: (gradeId) => playlists.filter((p) => p.gradeId === gradeId),
      playlistsByUnit: (unitIdOrName) =>
        playlists.filter((p) => matchesUnit(p, unitIdOrName)),
      playlistsByStage: (stageId) => playlists.filter((p) => p.stageId === stageId),
      refresh: hydrate,
    };
  }, [bundle, hydrate, ready]);

  return (
    <AcademicCatalogContext.Provider value={value}>{children}</AcademicCatalogContext.Provider>
  );
}

export function useAcademicCatalog() {
  const ctx = useContext(AcademicCatalogContext);
  if (!ctx) {
    console.error("useAcademicCatalog must be used within AcademicCatalogProvider");
    return {
      ready: true,
      source: "mock" as const,
      stages: [],
      grades: [],
      units: [],
      materials: [],
      playlists: [],
      gradesByStage: () => [],
      unitsByGrade: () => [],
      materialsByGrade: () => [],
      materialsByUnit: () => [],
      playlistsByGrade: () => [],
      playlistsByUnit: () => [],
      playlistsByStage: () => [],
      refresh: async () => undefined,
    } satisfies AcademicCatalogValue;
  }
  return ctx;
}
