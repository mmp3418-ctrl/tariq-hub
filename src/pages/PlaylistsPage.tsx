import { ExternalLink, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ResourceCard } from "../components/catalog/ResourceCard.tsx";
import { StageGradeFlow, type FlowStep } from "../components/catalog/StageGradeFlow.tsx";
import { VideoPlayerModal } from "../components/study/VideoPlayerModal.tsx";
import { CatalogSkeleton } from "../components/ui/CatalogSkeleton.tsx";
import { ExternalAnchor } from "../components/ui/ExternalAnchor.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { gradeLabel, subjectLabel } from "../i18n/content.ts";
import { normalizeExternalHref } from "../lib/contactLinks.ts";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import {
  useCatalogLessons,
  useCatalogSource,
  usePlaylistsByUnit,
  useUnitsByGrade,
} from "../services/hooks/useCurriculum.ts";
import type { CatalogLesson, CurriculumUnit, StageId } from "../services/types.ts";

function youtubeWatchUrl(lesson: CatalogLesson) {
  const raw = (lesson.videoUrl || "").trim();
  const external = normalizeExternalHref(raw);
  if (external) return external;
  if (lesson.playlistId && !lesson.playlistId.includes("://")) {
    return `https://www.youtube.com/playlist?list=${lesson.playlistId}`;
  }
  return "";
}

export function PlaylistsPage() {
  const lessons = useCatalogLessons();
  const { ready } = useCatalogSource();
  const { t, locale } = usePreferences();
  const [step, setStep] = useState<FlowStep>("stages");
  const [stageId, setStageId] = useState<StageId | null>(null);
  const [gradeId, setGradeId] = useState<string | null>(null);
  const [unitId, setUnitId] = useState<string | null>(null);
  const [active, setActive] = useState<CatalogLesson | null>(null);
  usePageTitle(t("playlists"));

  const units = useUnitsByGrade(gradeId ?? "");
  const unitPlaylists = usePlaylistsByUnit(unitId ?? "");

  useEffect(() => {
    if (step !== "units" || !gradeId) return;
    if (units.length === 0) setStep("content");
  }, [gradeId, step, units.length]);

  const gradeLessons = useMemo(
    () => (gradeId ? lessons.filter((lesson) => lesson.gradeId === gradeId) : []),
    [gradeId, lessons],
  );

  const groupedByUnit = useMemo(() => {
    type Bucket = { unit: CurriculumUnit | null; items: CatalogLesson[] };
    if (!gradeId) return [] as Bucket[];

    if (unitId) {
      const unit = units.find((item) => item.id === unitId) ?? null;
      return [{ unit, items: unitPlaylists }] satisfies Bucket[];
    }

    // Grade-wide view: cluster playlists under their units when possible.
    const buckets: Bucket[] = units.map((unit) => ({
      unit,
      items: gradeLessons.filter((lesson) => lesson.unitId === unit.id),
    }));
    const orphan = gradeLessons.filter(
      (lesson) => !lesson.unitId || !units.some((unit) => unit.id === lesson.unitId),
    );
    const result = buckets.filter((bucket) => bucket.items.length > 0);
    if (orphan.length > 0) result.push({ unit: null, items: orphan });
    return result;
  }, [gradeId, gradeLessons, unitId, unitPlaylists, units]);

  const totalItems = groupedByUnit.reduce((sum, group) => sum + group.items.length, 0);

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
        <StageGradeFlow
          step={step}
          stageId={stageId}
          gradeId={gradeId}
          unitId={unitId}
          enableUnits
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
          emptyLabel={t("noResults")}
          content={
            totalItems === 0 ? (
              <p className="text-sm leading-7 text-muted">{t("noGradePlaylists")}</p>
            ) : (
              <div className="space-y-8">
                <p className="text-sm text-muted">
                  {unitId ? t("playlistsUnitScope") : t("playlistsGradeScope")}
                </p>
                {groupedByUnit.map((group) => (
                  <section key={group.unit?.id || "ungrouped"} className="min-w-0">
                    <div className="mb-3 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">
                          YouTube
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                          {group.unit?.title || t("playlistsUngrouped")}
                        </h3>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-teal">
                        {group.items.length}
                      </span>
                    </div>
                    <ul className="grid gap-4 sm:grid-cols-2">
                      {group.items.map((lesson) => {
                        const yt = youtubeWatchUrl(lesson);
                        return (
                          <li key={lesson.id} className="min-w-0">
                            <ResourceCard
                              variant="video"
                              title={
                                locale === "en"
                                  ? `Lesson · ${subjectLabel(locale, lesson.subjectCode, lesson.subjectTitle)}`
                                  : lesson.title
                              }
                              meta={`${lesson.subjectCode} · ${subjectLabel(locale, lesson.subjectCode, lesson.subjectTitle)}`}
                              description={lesson.description}
                              coverImage={lesson.coverImage}
                              cardColor={lesson.cardColor}
                              iconName={lesson.iconName}
                              term={lesson.detail}
                              isComingSoon={lesson.isComingSoon}
                              onOpen={() => setActive(lesson)}
                              actions={
                                yt ? (
                                  <ExternalAnchor
                                    href={yt}
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal"
                                  >
                                    <Play className="size-3.5" />
                                    {t("openOnYoutube")}
                                    <ExternalLink className="size-3 opacity-70" />
                                  </ExternalAnchor>
                                ) : null
                              }
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            )
          }
        />
      )}

      <VideoPlayerModal
        lesson={active}
        meta={
          active
            ? `${gradeLabel(locale, active.gradeId, active.gradeTitle)} · ${subjectLabel(locale, active.subjectCode, active.subjectTitle)}`
            : ""
        }
        onClose={() => setActive(null)}
        closeLabel={t("closePlayer")}
      />
    </Shell>
  );
}
