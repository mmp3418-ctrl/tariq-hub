import { ChevronLeft, ChevronRight, Download, ExternalLink, Eye, Play } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PlaylistCover } from "../components/playlists/PlaylistCover.tsx";
import { CatalogSkeleton } from "../components/ui/CatalogSkeleton.tsx";
import { EmptyIcons, EmptyState } from "../components/ui/EmptyState.tsx";
import { ExternalAnchor } from "../components/ui/ExternalAnchor.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import { useAcademicCatalog } from "../services/AcademicCatalogProvider.tsx";
import type { MaterialView, PlaylistView } from "../services/academicCatalog.ts";

const TYPE_ORDER = [
  "classbook",
  "كتاب حصة",
  "book",
  "workbook",
  "كتاب واجب",
  "notebook",
  "كراسة",
  "note",
  "grammar",
  "قواعد",
  "vocabulary",
  "مفردات",
  "worksheet",
  "ورقة عمل",
];

function groupMaterialsByType(items: MaterialView[]) {
  const map = new Map<string, MaterialView[]>();
  for (const item of items) {
    const key = item.materialType || "classbook";
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return [...map.entries()].sort((a, b) => {
    const ai = TYPE_ORDER.indexOf(a[0]);
    const bi = TYPE_ORDER.indexOf(b[0]);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

function groupPlaylistsByUnit(items: PlaylistView[], ungroupedLabel: string) {
  const map = new Map<string, PlaylistView[]>();
  for (const item of items) {
    const key = (item.unitName || "").trim() || ungroupedLabel;
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return [...map.entries()].sort((a, b) => {
    if (a[0] === ungroupedLabel) return 1;
    if (b[0] === ungroupedLabel) return -1;
    return a[0].localeCompare(b[0], "ar");
  });
}

function embedUrl(youtubeUrl: string) {
  try {
    const url = new URL(youtubeUrl);
    const list = url.searchParams.get("list");
    if (list) return `https://www.youtube.com/embed/videoseries?list=${list}`;
    const video =
      url.searchParams.get("v") ||
      (url.hostname.includes("youtu.be") ? url.pathname.replace("/", "") : "");
    return video ? `https://www.youtube.com/embed/${video}` : "";
  } catch {
    return "";
  }
}

export function GradeDetailsPage() {
  const { gradeId = "" } = useParams();
  const {
    ready,
    grades,
    stages,
    materialsByGrade,
    playlistsByGrade,
  } = useAcademicCatalog();
  const { t, locale, dir } = usePreferences();
  const [activePlaylist, setActivePlaylist] = useState<PlaylistView | null>(null);
  const BackIcon = dir === "rtl" ? ChevronRight : ChevronLeft;

  const grade = useMemo(
    () => (Array.isArray(grades) ? grades : []).find((g) => g.id === gradeId) ?? null,
    [gradeId, grades],
  );
  const stage = useMemo(
    () =>
      grade
        ? (Array.isArray(stages) ? stages : []).find((s) => s.id === grade.stageId) ?? null
        : null,
    [grade, stages],
  );

  const materials = useMemo(
    () => (gradeId ? materialsByGrade(gradeId) : []),
    [gradeId, materialsByGrade],
  );
  const playlists = useMemo(
    () => (gradeId ? playlistsByGrade(gradeId) : []),
    [gradeId, playlistsByGrade],
  );

  const materialGroups = useMemo(() => groupMaterialsByType(materials), [materials]);
  const playlistGroups = useMemo(
    () => groupPlaylistsByUnit(playlists, t("playlistsUngrouped")),
    [playlists, t],
  );

  const title = grade?.name || t("missingGrade");
  usePageTitle(title);

  if (!ready) {
    return (
      <Shell className="pb-20">
        <p className="sr-only">{t("loadingCatalog")}</p>
        <CatalogSkeleton rows={4} />
      </Shell>
    );
  }

  if (!grade) {
    return (
      <Shell className="pb-20">
        <EmptyState
          icon={EmptyIcons.stages}
          title={t("missingGrade")}
          description={t("missingGradeBody")}
          action={
            <Link to="/grades" className="inline-flex items-center gap-1 text-sm font-semibold text-teal">
              <BackIcon className="size-4" />
              {t("backToGrades")}
            </Link>
          }
        />
      </Shell>
    );
  }

  return (
    <Shell className="overflow-x-hidden pb-20">
      <Folio index="02" label={t("folioGrades")} />
      <header className="glass max-w-3xl rounded-2xl p-5 pt-7 sm:p-8 sm:pt-10">
        <Link
          to={stage ? `/grades?stage=${stage.id}` : "/grades"}
          className="inline-flex items-center gap-1 text-sm font-semibold text-teal"
        >
          <BackIcon className="size-4" />
          {t("backToGrades")}
        </Link>
        <p className="mt-4 text-sm text-teal">
          {stage?.name || t("stepStages")}
          {" · "}
          {t("resourcesForGrade")}
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl lg:text-6xl">
          {grade.name}
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted sm:mt-5 sm:text-base sm:leading-8">
          {t("gradeDetailsLead")}
        </p>
      </header>

      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-teal">{t("libraryKind")}</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {t("workspaceNotes")}
            </h2>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-teal">
            {materials.length}
          </span>
        </div>

        {materialGroups.length === 0 ? (
          <EmptyState
            icon={EmptyIcons.materials}
            title={t("emptyMaterialsTitle")}
            description={t("emptyMaterialsLead")}
            tone="soft"
          />
        ) : (
          <div className="space-y-8">
            {materialGroups.map(([type, items]) => (
              <div key={type} className="min-w-0">
                <div className="mb-3 flex items-end justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {locale === "en" ? items[0]?.badgeEn : items[0]?.badgeAr}
                  </h3>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-teal">
                    {items.length}
                  </span>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {items.map((item) => (
                    <li key={item.id}>
                      <article className="glass flex h-full flex-col gap-3 rounded-2xl p-4 sm:p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-teal">
                            {locale === "en" ? item.badgeEn : item.badgeAr}
                          </span>
                          {item.unitName ? (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {item.unitName}
                            </span>
                          ) : null}
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h4>
                        <div className="mt-auto flex flex-wrap gap-3 pt-1 text-sm font-semibold">
                          <ExternalAnchor
                            href={item.pdfUrl}
                            kind="pdf"
                            className="inline-flex items-center gap-1.5 text-teal"
                          >
                            <Eye className="size-4" />
                            {t("quickPreview")}
                          </ExternalAnchor>
                          <ExternalAnchor
                            href={item.pdfUrl}
                            kind="pdf"
                            download={`${item.title || "material"}.pdf`}
                            className="inline-flex items-center gap-1.5 text-slate-900 dark:text-white"
                          >
                            <Download className="size-4" />
                            {t("downloadDirect")}
                          </ExternalAnchor>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-teal">{t("playlistsKind")}</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {t("workspacePlaylists")}
            </h2>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-teal">
            {playlists.length}
          </span>
        </div>

        {playlistGroups.length === 0 ? (
          <EmptyState
            icon={EmptyIcons.playlists}
            title={t("emptyPlaylistsTitle")}
            description={t("emptyPlaylistsLead")}
            tone="soft"
          />
        ) : (
          <div className="space-y-8">
            {playlistGroups.map(([unitName, items]) => (
              <div key={unitName} className="min-w-0">
                <div className="mb-3 flex items-end justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{unitName}</h3>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-teal">
                    {items.length}
                  </span>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {items.map((item) => (
                    <li key={item.id}>
                      <article className="glass flex h-full flex-col gap-3 overflow-hidden rounded-2xl p-4 sm:p-5">
                        <PlaylistCover
                          src={item.coverImageUrl}
                          title={item.title}
                          className="-mx-1"
                        />
                        <div className="flex flex-wrap gap-2">
                          {item.materialType ? (
                            <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-teal">
                              {locale === "en" ? item.badgeEn : item.badgeAr}
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-teal">
                              YouTube
                            </span>
                          )}
                          {item.unitName ? (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {item.unitName}
                            </span>
                          ) : null}
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h4>
                        <div className="mt-auto flex flex-wrap gap-3 pt-1 text-sm font-semibold">
                          <button
                            type="button"
                            onClick={() => setActivePlaylist(item)}
                            className="inline-flex items-center gap-1.5 text-teal"
                          >
                            <Play className="size-4" />
                            {t("openPlayer")}
                          </button>
                          <ExternalAnchor
                            href={item.youtubeUrl}
                            className="inline-flex items-center gap-1.5 text-slate-900 dark:text-white"
                          >
                            {t("openOnYoutube")}
                            <ExternalLink className="size-3.5 opacity-70" />
                          </ExternalAnchor>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {activePlaylist ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-navy/75 backdrop-blur-md"
            aria-label={t("closePlayer")}
            onClick={() => setActivePlaylist(null)}
          />
          <div className="glass-strong relative w-full max-w-[min(56rem,100vw)] overflow-hidden rounded-t-2xl sm:rounded-2xl">
            <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0F172A] px-4 py-3 text-white sm:px-5">
              <h2 className="truncate text-lg font-bold">{activePlaylist.title}</h2>
              <button
                type="button"
                onClick={() => setActivePlaylist(null)}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white/80 hover:bg-white/10"
              >
                {t("closePlayer")}
              </button>
            </header>
            <div className="aspect-video bg-black">
              {embedUrl(activePlaylist.youtubeUrl) ? (
                <iframe
                  title={activePlaylist.title}
                  src={embedUrl(activePlaylist.youtubeUrl)}
                  className="size-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex size-full items-center justify-center p-6 text-center text-sm text-white/80">
                  <ExternalAnchor href={activePlaylist.youtubeUrl} className="text-emerald">
                    {t("openOnYoutube")}
                  </ExternalAnchor>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}
