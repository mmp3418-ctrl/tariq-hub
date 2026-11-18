import { materialTypeBadge, normalizeMaterialType } from "../lib/materialTypes.ts";
import { normalizeExternalHref, normalizeMediaHref } from "../lib/contactLinks.ts";
import { isSupabaseConfigured, supabase, supabaseUrl } from "../lib/supabase.ts";

/** Storage buckets used by tariq-admin material uploads. */
const MATERIALS_BUCKETS = ["pdfs", "uploads", "materials"] as const;

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
  /** Canonical column written by tariq-admin */
  file_url?: string | null;
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
  /** Canonical column written by tariq-admin */
  playlist_url?: string | null;
  youtube_url?: string | null;
  cover_image_url?: string | null;
  material_type?: string | null;
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
  coverImageUrl: string;
  materialType: string;
  badgeAr: string;
  badgeEn: string;
  stageId: string;
  gradeId: string;
  unitId: string;
  unitName: string;
  stageName: string;
  gradeName: string;
};

function activeRow(row: { is_active?: boolean | null }) {
  // Match admin: null/undefined count as active.
  return row.is_active !== false;
}

function storagePublicUrl(objectPath: string) {
  const path = objectPath.replace(/^\/+/, "");
  if (!path || !supabaseUrl) return "";
  for (const bucket of MATERIALS_BUCKETS) {
    if (path.startsWith(`${bucket}/`)) {
      return `${supabaseUrl}/storage/v1/object/public/${path}`;
    }
  }
  if (supabase) {
    const { data } = supabase.storage.from(MATERIALS_BUCKETS[0]).getPublicUrl(path);
    if (data?.publicUrl) return data.publicUrl;
  }
  return `${supabaseUrl}/storage/v1/object/public/${MATERIALS_BUCKETS[0]}/${path}`;
}

/** Resolve PDF from file_url (canonical), then legacy file_path / pdf_url. */
function resolvePdfUrl(row: DbEducationalMaterial) {
  const raw = String(row.file_url ?? row.file_path ?? row.pdf_url ?? "").trim();
  if (!raw) return "";

  const media = normalizeMediaHref(raw) || normalizeExternalHref(raw);
  if (media) return media;

  if (!/^https?:\/\//i.test(raw) && !raw.startsWith("/") && raw.includes(".")) {
    return storagePublicUrl(raw);
  }
  return "";
}

/** Resolve playlist from playlist_url (canonical), then legacy youtube_url. */
function resolvePlaylistUrl(row: DbVideoPlaylist) {
  const raw = String(row.playlist_url ?? row.youtube_url ?? "").trim();
  if (!raw) return "";
  return normalizeExternalHref(raw);
}

function sampleRowKeys(row: Record<string, unknown> | null | undefined) {
  if (!row) return [];
  return Object.keys(row);
}

/**
 * Fetch active rows with resilient fallbacks when schema columns differ.
 * Always prefers `is_active = true`, then softens only if the column is missing
 * or the active filter returns nothing while inactive-inclusive rows exist.
 */
async function fetchActiveTableRows<T extends { is_active?: boolean | null }>(
  table: string,
): Promise<T[] | null> {
  if (!supabase || !isSupabaseConfigured) {
    console.warn(`[tariq] ${table}: Supabase not configured`);
    return null;
  }

  const primary = await supabase
    .from(table)
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (!primary.error) {
    let rows = (primary.data as T[] | null) ?? [];
    console.info(`[tariq] ${table}: fetched`, rows.length, "active row(s)");

    // Diagnostic: if zero active, check whether inactive-inclusive rows exist.
    if (rows.length === 0) {
      const all = await supabase.from(table).select("*");
      if (!all.error) {
        const every = (all.data as T[] | null) ?? [];
        const soft = every.filter(activeRow);
        console.warn(`[tariq] ${table}: 0 with is_active=true; total=${every.length}, soft-active=${soft.length}`, {
          sampleKeys: sampleRowKeys(every[0] as Record<string, unknown> | undefined),
          sample: every[0]
            ? {
                id: (every[0] as { id?: string }).id,
                is_active: every[0].is_active,
                title: (every[0] as { title?: string }).title,
              }
            : null,
        });
        if (soft.length > 0) {
          console.warn(`[tariq] ${table}: using soft-active fallback (${soft.length})`);
          rows = soft;
        }
      }
    } else {
      console.info(`[tariq] ${table}: sample keys`, sampleRowKeys(rows[0] as Record<string, unknown>));
    }
    return rows;
  }

  console.error(`[tariq] ${table} primary query:`, primary.error.message, primary.error);

  if (/created_at|sort_order/i.test(primary.error.message)) {
    const fallback = await supabase.from(table).select("*").eq("is_active", true);
    if (!fallback.error) {
      const rows = (fallback.data as T[] | null) ?? [];
      console.info(`[tariq] ${table}: order-fallback fetched`, rows.length);
      return rows;
    }
    console.error(`[tariq] ${table} order-fallback:`, fallback.error.message, fallback.error);
  }

  if (/is_active/i.test(primary.error.message)) {
    const legacy = await supabase.from(table).select("*");
    if (!legacy.error) {
      const rows = ((legacy.data as T[] | null) ?? []).filter(activeRow);
      console.warn(`[tariq] ${table}: legacy fetch without is_active →`, rows.length);
      return rows;
    }
    console.error(`[tariq] ${table} legacy:`, legacy.error.message, legacy.error);
  }

  // Absolute last resort
  const bare = await supabase.from(table).select("*");
  if (!bare.error) {
    const rows = ((bare.data as T[] | null) ?? []).filter(activeRow);
    console.warn(`[tariq] ${table}: bare select →`, rows.length);
    return rows;
  }

  console.error(`[tariq] ${table} bare select failed:`, bare.error.message, bare.error);
  return null;
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
  return fetchActiveTableRows<DbEducationalMaterial>("educational_materials");
}

export async function fetchActiveVideoPlaylists(): Promise<DbVideoPlaylist[] | null> {
  return fetchActiveTableRows<DbVideoPlaylist>("video_playlists");
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
    console.warn("[tariq] fetchAcademicBundle: Supabase not configured");
    return { stages: [], grades: [], units: [], materials: [], playlists: [], source: "mock" };
  }

  const [stagesRaw, gradesRaw, unitsRaw, materialsRaw, playlistsRaw] = await Promise.all([
    fetchActiveAcademicStages(),
    fetchActiveAcademicGrades(),
    fetchActiveAcademicUnits(),
    fetchActiveEducationalMaterials(),
    fetchActiveVideoPlaylists(),
  ]);

  console.info("[tariq] fetchAcademicBundle raw counts:", {
    stages: stagesRaw?.length ?? null,
    grades: gradesRaw?.length ?? null,
    units: unitsRaw?.length ?? null,
    materials: materialsRaw?.length ?? null,
    playlists: playlistsRaw?.length ?? null,
  });

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

  // —— Materials (file_url / file_path / pdf_url) ——
  const materialsMapped = (materialsRaw ?? []).filter(activeRow).map((row) => {
    const type = normalizeMaterialType(row.material_type);
    const pdfUrl = resolvePdfUrl(row);
    const unitId = row.unit_id ? String(row.unit_id) : "";
    const typedUnit = (row.unit_name || "").trim();
    const stageId = row.stage_id ? String(row.stage_id) : "";
    const gradeId = row.grade_id ? String(row.grade_id) : "";
    return {
      id: String(row.id),
      title: (row.title || "").trim() || "مادة",
      materialType: type,
      badgeAr: materialTypeBadge(type, "ar"),
      badgeEn: materialTypeBadge(type, "en"),
      pdfUrl,
      stageId,
      gradeId,
      unitId,
      unitName: typedUnit || (unitId ? unitNameById.get(unitId) || "" : ""),
      stageName: stageId ? stageName.get(stageId) || "" : "",
      gradeName: gradeId ? gradeName.get(gradeId) || "" : "",
      _rawFile: String(row.file_url ?? row.file_path ?? row.pdf_url ?? "").trim() || null,
    };
  });

  const droppedMaterials = materialsMapped.filter((item) => !item.pdfUrl);
  if (droppedMaterials.length > 0) {
    console.warn(
      "[tariq] educational_materials: dropped (no resolvable file_url/file_path/pdf_url):",
      droppedMaterials.map((m) => ({ id: m.id, title: m.title, raw: m._rawFile, gradeId: m.gradeId })),
    );
  }

  const materials: MaterialView[] = materialsMapped
    .filter((item) => Boolean(item.pdfUrl))
    .map(({ _rawFile: _ignored, ...item }) => item);

  console.info("[tariq] educational_materials renderable:", {
    raw: materialsRaw?.length ?? 0,
    mapped: materialsMapped.length,
    withUrl: materials.length,
    byGrade: materials.reduce<Record<string, number>>((acc, m) => {
      const key = m.gradeId || "(none)";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  });

  // Typed units from materials + playlists (manual unit_name)
  const typedUnits: AcademicUnitView[] = [];
  const seenTyped = new Set(units.map((u) => `${u.gradeId}::${u.name}`));
  const rememberTyped = (gradeId: string, unitName: string) => {
    if (!gradeId || !unitName) return;
    const key = `${gradeId}::${unitName}`;
    if (seenTyped.has(key)) return;
    seenTyped.add(key);
    typedUnits.push({
      id: `typed:${gradeId}:${encodeURIComponent(unitName)}`,
      gradeId,
      name: unitName,
      sortOrder: 10_000 + typedUnits.length,
    });
  };

  for (const material of materials) {
    rememberTyped(material.gradeId, material.unitName);
  }

  // —— Playlists (playlist_url / youtube_url) ——
  const playlistsMapped = (playlistsRaw ?? []).filter(activeRow).map((row) => {
    const youtubeUrl = resolvePlaylistUrl(row);
    const coverRaw = String(row.cover_image_url ?? "").trim();
    const coverImageUrl =
      normalizeMediaHref(coverRaw) || normalizeExternalHref(coverRaw) || "";
    const unitId = row.unit_id ? String(row.unit_id) : "";
    const typedUnit = (row.unit_name || "").trim();
    const type = row.material_type ? normalizeMaterialType(row.material_type) : "";
    const stageId = row.stage_id ? String(row.stage_id) : "";
    const gradeId = row.grade_id ? String(row.grade_id) : "";
    return {
      id: String(row.id),
      title: (row.title || "").trim() || "شرح",
      youtubeUrl,
      coverImageUrl,
      materialType: type,
      badgeAr: type ? materialTypeBadge(type, "ar") : "يوتيوب",
      badgeEn: type ? materialTypeBadge(type, "en") : "YouTube",
      stageId,
      gradeId,
      unitId,
      unitName: typedUnit || (unitId ? unitNameById.get(unitId) || "" : ""),
      stageName: stageId ? stageName.get(stageId) || "" : "",
      gradeName: gradeId ? gradeName.get(gradeId) || "" : "",
      _rawUrl: String(row.playlist_url ?? row.youtube_url ?? "").trim() || null,
    };
  });

  const droppedPlaylists = playlistsMapped.filter((item) => !item.youtubeUrl);
  if (droppedPlaylists.length > 0) {
    console.warn(
      "[tariq] video_playlists: dropped (no resolvable playlist_url/youtube_url):",
      droppedPlaylists.map((p) => ({ id: p.id, title: p.title, raw: p._rawUrl, gradeId: p.gradeId })),
    );
  }

  const playlists: PlaylistView[] = playlistsMapped
    .filter((item) => Boolean(item.youtubeUrl))
    .map(({ _rawUrl: _ignored, ...item }) => item);

  for (const playlist of playlists) {
    rememberTyped(playlist.gradeId, playlist.unitName);
  }

  console.info("[tariq] video_playlists renderable:", {
    raw: playlistsRaw?.length ?? 0,
    mapped: playlistsMapped.length,
    withUrl: playlists.length,
    byGrade: playlists.reduce<Record<string, number>>((acc, p) => {
      const key = p.gradeId || "(none)";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  });

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
