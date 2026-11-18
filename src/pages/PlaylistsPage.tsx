import { ExternalLink, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  AcademicBrowseFlow,
  type AcademicFlowStep,
} from "../components/catalog/AcademicBrowseFlow.tsx";
import { PlaylistCover } from "../components/playlists/PlaylistCover.tsx";
import { CatalogSkeleton } from "../components/ui/CatalogSkeleton.tsx";
import { EmptyIcons, EmptyState } from "../components/ui/EmptyState.tsx";
import { ExternalAnchor } from "../components/ui/ExternalAnchor.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import { useAcademicCatalog } from "../services/AcademicCatalogProvider.tsx";
import type { PlaylistView } from "../services/academicCatalog.ts";

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

export function PlaylistsPage() {
  const {
    ready,
    playlistsByGrade,
    playlistsByUnit,
    playlistsByStage,
    unitsByGrade,
    stages,
  } = useAcademicCatalog();
  const { t } = usePreferences();
  const [step, setStep] = useState<AcademicFlowStep>("stages");
  const [stageId, setStageId] = useState<string | null>(null);
  const [gradeId, setGradeId] = useState<string | null>(null);
  const [unitId, setUnitId] = useState<string | null>(null);
  const [active, setActive] = useState<PlaylistView | null>(null);
  usePageTitle(t("playlists"));

  const units = unitsByGrade(gradeId ?? "");

  useEffect(() => {
    if (step !== "units" || !gradeId) return;
    if (units.length === 0) setStep("content");
  }, [gradeId, step, units.length]);

  const grouped = useMemo(() => {
    if (unitId) {
      let items = playlistsByUnit(unitId);
      const unit = units.find((u) => u.id === unitId);
      if (items.length === 0 && gradeId) {
        const gradeItems = playlistsByGrade(gradeId);
        items = gradeItems.filter(
          (p) => !unit || p.unitName === unit.name || p.unitId === unit.id,
        );
        if (items.length === 0) {
          console.warn("[tariq] PlaylistsPage: unit filter empty, falling back to grade", {
            unitId,
            gradeId,
            gradeCount: gradeItems.length,
          });
          items = gradeItems;
        }
      }
      return [{ key: unitId, title: unit?.name || t("playlistsUnitScope"), items }];
    }

    if (gradeId) {
      const gradeItems = playlistsByGrade(gradeId);
      const buckets = units.map((unit) => ({
        key: unit.id,
        title: unit.name,
        items: gradeItems.filter(
          (p) => p.unitId === unit.id || p.unitName === unit.name,
        ),
      }));
      const orphan = gradeItems.filter(
        (p) =>
          !units.some((u) => u.id === p.unitId || u.name === p.unitName),
      );
      const result = buckets.filter((b) => b.items.length > 0);
      if (orphan.length > 0) {
        result.push({ key: "ungrouped", title: t("playlistsUngrouped"), items: orphan });
      }
      return result;
    }

    if (stageId) {
      const stageItems = playlistsByStage(stageId);
      const stageName = stages.find((s) => s.id === stageId)?.name || "";
      return [{ key: stageId, title: stageName || t("playlistsGradeScope"), items: stageItems }];
    }

    return [];
  }, [
    gradeId,
    playlistsByGrade,
    playlistsByStage,
    playlistsByUnit,
    stageId,
    stages,
    t,
    unitId,
    units,
  ]);

  const total = grouped.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <Shell className="overflow-x-hidden pb-20">
      <Folio index="04" label={t("folioPlaylists")} />
      <header className="glass max-w-3xl rounded-2xl p-5 pt-7 sm:p-8 sm:pt-10">
        <p className="text-sm text-teal">{t("playlistsKind")}</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl lg:text-6xl">
          {t("playlistsHeading")}
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted sm:mt-5 sm:text-base sm:leading-8">
          {t("playlistsLead")}
        </p>
      </header>

      {!ready ? (
        <div>
          <p className="sr-only">{t("loadingCatalog")}</p>
          <CatalogSkeleton rows={4} />
        </div>
      ) : (
        <AcademicBrowseFlow
          step={step}
          stageId={stageId}
          gradeId={gradeId}
          unitId={unitId}
          onSelectStage={(id) => {
            setStageId(id);
            setGradeId(null);
            setUnitId(null);
            setStep("grades");
          }}
          onSelectGrade={(id) => {
            setGradeId(id);
            setUnitId(null);
            setStep("units");
          }}
          onSelectUnit={(id) => {
            setUnitId(id);
            setStep("content");
          }}
          onBackToStages={() => {
            setStageId(null);
            setGradeId(null);
            setUnitId(null);
            setStep("stages");
          }}
          onBackToGrades={() => {
            setGradeId(null);
            setUnitId(null);
            setStep("grades");
          }}
          onBackToUnits={() => {
            setUnitId(null);
            setStep(units.length > 0 ? "units" : "grades");
          }}
          emptyLabel={t("emptyPlaylistsLead")}
          content={
            total === 0 ? (
              <EmptyState
                icon={EmptyIcons.playlists}
                title={t("emptyPlaylistsTitle")}
                description={t("emptyPlaylistsLead")}
                tone="soft"
              />
            ) : (
              <div className="space-y-8">
                <p className="text-sm text-muted">
                  {unitId ? t("playlistsUnitScope") : t("playlistsGradeScope")}
                </p>
                {grouped.map((group) => (
                  <section key={group.key} className="min-w-0">
                    <div className="mb-3 flex items-end justify-between gap-3">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {group.title}
                      </h3>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-teal">
                        {group.items.length}
                      </span>
                    </div>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {group.items.map((item) => (
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
                                  {item.badgeAr}
                                </span>
                              ) : (
                                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-teal">
                                  YouTube
                                </span>
                              )}
                              {item.stageName ? (
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                  {item.stageName}
                                </span>
                              ) : null}
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
                                onClick={() => setActive(item)}
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
                  </section>
                ))}
              </div>
            )
          }
        />
      )}

      {active ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-navy/75 backdrop-blur-md"
            aria-label={t("closePlayer")}
            onClick={() => setActive(null)}
          />
          <div className="glass-strong relative w-full max-w-[min(56rem,100vw)] overflow-hidden rounded-t-2xl sm:rounded-2xl">
            <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0F172A] px-4 py-3 text-white sm:px-5">
              <h2 className="truncate text-lg font-bold">{active.title}</h2>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white/80 hover:bg-white/10"
              >
                {t("closePlayer")}
              </button>
            </header>
            <div className="aspect-video bg-black">
              {embedUrl(active.youtubeUrl) ? (
                <iframe
                  title={active.title}
                  src={embedUrl(active.youtubeUrl)}
                  className="size-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex size-full items-center justify-center p-6 text-center text-sm text-white/80">
                  <ExternalAnchor href={active.youtubeUrl} className="text-emerald">
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
