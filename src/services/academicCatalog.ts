import { materialTypeBadge, normalizeMaterialType } from "../lib/materialTypes.ts";
import { normalizeExternalHref, normalizeMediaHref } from "../lib/contactLinks.ts";
import { isSupabaseConfigured, supabase } from "../lib/supabase.ts";

export type DbAcademicStage = {
  id: string;
  name: string;
  sort_order?: number | null;
  is_active?: boolean | null;
};

export type DbAcademicGrade = {
  id: string;
  stage_id: string;
  name: string;
  sort_order?: number | null;
  is_active?: boolean | null;
};

export type DbAcademicUnit = {
  id: string;
  grade_id: string;
  name: string;
  sort_order?: number | null;
  is_active?: boolean | null;
};

export type DbEducationalMaterial = {
  id: string;
  title?: string | null;
  material_type?: string | null;
  file_path?: string | null;
  pdf_url?: string | null;
  unit_name?: string | null;
  stage_id?: string | null;
  grade_id?: string | null;
  unit_id?: string | null;
  is_active?: boolean | null;
  sort_order?: number | null;
};

export type DbVideoPlaylist = {
  id: string;
  title?: string | null;
  youtube_url?: string | null;
  stage_id?: string | null;
  grade_id?: string | null;
  unit_id?: string | null;
  unit_name?: string | null;
  is_active?: boolean | null;
  sort_order?: number | null;
};

export type AcademicStageView = {
  id: string;
  name: string;
  sortOrder: number;
};

export type AcademicGradeView = {
  id: string;
  stageId: string;
  name: string;
  sortOrder: number;
};

export type AcademicUnitView = {
  id: string;
  gradeId: string;
  name: string;
  sortOrder: number;
};

export type MaterialView = {
  id: string;
  title: string;
  materialType: string;
  badgeAr: string;
  badgeEn: string;
  pdfUrl: string;
  stageId: string;
  gradeId: string;
  unitId: string;
  unitName: string;
  stageName: string;
  gradeName: string;
};

export type PlaylistView = {
  id: string;
  title: string;
  youtubeUrl: string;
  stageId: string;
  gradeId: string;
  unitId: string;
  unitName: string;
  stageName: string;
  gradeName: string;
};

function activeRow(row: { is_active?: boolean | null }) {
  return row.is_active !== false;
}

function resolvePdfUrl(row: DbEducationalMaterial) {
  const raw = (row.file_path || row.pdf_url || "").trim();
  return normalizeMediaHref(raw) || normalizeExternalHref(raw);
}

async function safeSelect<T>(
  table: string,
  build: () => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await build();
    if (error) {
      console.error(`[tariq] ${table}:`, error.message, error);
      return null;
    }
    return data ?? [];
  } catch (err) {
    console.error(`[tariq] ${table} exception:`, err);
    return null;
  }
}

export async function fetchActiveAcademicStages(): Promise<DbAcademicStage[] | null> {
  return safeSelect("academic_stages", () =>
    supabase!
      .from("academic_stages")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  );
}

export async function fetchActiveAcademicGrades(): Promise<DbAcademicGrade[] | null> {
  return safeSelect("academic_grades", () =>
    supabase!
      .from("academic_grades")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  );
}

export async function fetchActiveAcademicUnits(): Promise<DbAcademicUnit[] | null> {
  return safeSelect("academic_units", () =>
    supabase!
      .from("academic_units")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  );
}

export async function fetchActiveEducationalMaterials(): Promise<DbEducationalMaterial[] | null> {
  return safeSelect("educational_materials", () =>
    supabase!
      .from("educational_materials")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
  );
}

export async function fetchActiveVideoPlaylists(): Promise<DbVideoPlaylist[] | null> {
  return safeSelect("video_playlists", () =>
    supabase!
      .from("video_playlists")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
  );
}

export type AcademicBundle = {
  stages: AcademicStageView[];
  grades: AcademicGradeView[];
  units: AcademicUnitView[];
  materials: MaterialView[];
  playlists: PlaylistView[];
  source: "mock" | "supabase";
};

export async function fetchAcademicBundle(): Promise<AcademicBundle> {
  if (!isSupabaseConfigured || !supabase) {
    return { stages: [], grades: [], units: [], materials: [], playlists: [], source: "mock" };
  }

  const [stagesRaw, gradesRaw, unitsRaw, materialsRaw, playlistsRaw] = await Promise.all([
    fetchActiveAcademicStages(),
    fetchActiveAcademicGrades(),
    fetchActiveAcademicUnits(),
    fetchActiveEducationalMaterials(),
    fetchActiveVideoPlaylists(),
  ]);

  const stages = (stagesRaw ?? [])
    .filter(activeRow)
    .map((row, index) => ({
      id: String(row.id),
      name: (row.name || "").trim() || `Stage ${index + 1}`,
      sortOrder: Number(row.sort_order ?? index),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const stageIds = new Set(stages.map((s) => s.id));

  const grades = (gradesRaw ?? [])
    .filter(activeRow)
    .filter((row) => stageIds.has(String(row.stage_id)))
    .map((row, index) => ({
      id: String(row.id),
      stageId: String(row.stage_id),
      name: (row.name || "").trim() || `Grade ${index + 1}`,
      sortOrder: Number(row.sort_order ?? index),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const gradeIds = new Set(grades.map((g) => g.id));

  const units = (unitsRaw ?? [])
    .filter(activeRow)
    .filter((row) => gradeIds.has(String(row.grade_id)))
    .map((row, index) => ({
      id: String(row.id),
      gradeId: String(row.grade_id),
      name: (row.name || "").trim() || `Unit ${index + 1}`,
      sortOrder: Number(row.sort_order ?? index),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const stageName = new Map(stages.map((s) => [s.id, s.name]));
  const gradeName = new Map(grades.map((g) => [g.id, g.name]));
  const unitNameById = new Map(units.map((u) => [u.id, u.name]));

  const materials: MaterialView[] = (materialsRaw ?? [])
    .filter(activeRow)
    .map((row) => {
      const type = normalizeMaterialType(row.material_type);
      const pdfUrl = resolvePdfUrl(row);
      const unitId = row.unit_id ? String(row.unit_id) : "";
      const typedUnit = (row.unit_name || "").trim();
      return {
        id: String(row.id),
        title: (row.title || "").trim() || "مادة",
        materialType: type,
        badgeAr: materialTypeBadge(type, "ar"),
        badgeEn: materialTypeBadge(type, "en"),
        pdfUrl,
        stageId: row.stage_id ? String(row.stage_id) : "",
        gradeId: row.grade_id ? String(row.grade_id) : "",
        unitId,
        unitName: typedUnit || (unitId ? unitNameById.get(unitId) || "" : ""),
        stageName: row.stage_id ? stageName.get(String(row.stage_id)) || "" : "",
        gradeName: row.grade_id ? gradeName.get(String(row.grade_id)) || "" : "",
      };
    })
    .filter((item) => Boolean(item.pdfUrl));

  // Merge typed unit names from materials into the units list for grade browsing.
  const typedUnits: AcademicUnitView[] = [];
  const seenTyped = new Set(units.map((u) => `${u.gradeId}::${u.name}`));
  for (const material of materials) {
    if (!material.gradeId || !material.unitName) continue;
    const key = `${material.gradeId}::${material.unitName}`;
    if (seenTyped.has(key)) continue;
    seenTyped.add(key);
    typedUnits.push({
      id: `typed:${material.gradeId}:${encodeURIComponent(material.unitName)}`,
      gradeId: material.gradeId,
      name: material.unitName,
      sortOrder: 10_000 + typedUnits.length,
    });
  }

  const playlists: PlaylistView[] = (playlistsRaw ?? [])
    .filter(activeRow)
    .map((row) => {
      const youtubeUrl = normalizeExternalHref(row.youtube_url || "");
      const unitId = row.unit_id ? String(row.unit_id) : "";
      const typedUnit = (row.unit_name || "").trim();
      return {
        id: String(row.id),
        title: (row.title || "").trim() || "شرح",
        youtubeUrl,
        stageId: row.stage_id ? String(row.stage_id) : "",
        gradeId: row.grade_id ? String(row.grade_id) : "",
        unitId,
        unitName: typedUnit || (unitId ? unitNameById.get(unitId) || "" : ""),
        stageName: row.stage_id ? stageName.get(String(row.stage_id)) || "" : "",
        gradeName: row.grade_id ? gradeName.get(String(row.grade_id)) || "" : "",
      };
    })
    .filter((item) => Boolean(item.youtubeUrl));

  const hasData =
    stages.length > 0 ||
    grades.length > 0 ||
    materials.length > 0 ||
    playlists.length > 0;

  return {
    stages,
    grades,
    units: [...units, ...typedUnits],
    materials,
    playlists,
    source: hasData ? "supabase" : "mock",
  };
}
