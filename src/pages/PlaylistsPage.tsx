import { Play, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { VideoPlayerModal } from "../components/study/VideoPlayerModal.tsx";
import { FilterChip } from "../components/ui/FilterChip.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { gradeLabel, stageLabel, subjectLabel } from "../i18n/content.ts";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import { useCatalogLessons, useStages } from "../services/hooks/useCurriculum.ts";
import type { CatalogLesson, StageId } from "../services/types.ts";

export function PlaylistsPage() {
  const lessons = useCatalogLessons();
  const stages = useStages();
  const { t, locale } = usePreferences();
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageId | "all">("all");
  const [active, setActive] = useState<CatalogLesson | null>(null);
  usePageTitle(t("playlists"));

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return lessons.filter((lesson) => {
      if (stageFilter !== "all" && lesson.stageId !== stageFilter) return false;
      if (!needle) return true;
      const hay = `${lesson.title} ${lesson.subjectTitle} ${lesson.gradeTitle} ${lesson.stageTitle} ${lesson.subjectCode}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [lessons, query, stageFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, { gradeTitle: string; stageTitle: string; gradeId: string; stageId: StageId; items: CatalogLesson[] }>();
    for (const lesson of visible) {
      const current = map.get(lesson.gradeId);
      if (current) current.items.push(lesson);
      else {
        map.set(lesson.gradeId, {
          gradeTitle: lesson.gradeTitle,
          stageTitle: lesson.stageTitle,
          gradeId: lesson.gradeId,
          stageId: lesson.stageId,
          items: [lesson],
        });
      }
    }
    return [...map.values()];
  }, [visible]);

  return (
    <Shell className="pb-20">
      <Folio index="04" label={t("folioPlaylists")} />
      <header className="glass flex flex-col gap-6 rounded-2xl p-5 pt-7 sm:gap-8 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm text-teal">{t("playlistsKind")}</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl lg:text-6xl">{t("playlistsHeading")}</h1>
          <p className="mt-4 text-sm leading-7 text-muted sm:mt-5 sm:text-base sm:leading-8">{t("playlistsLead")}</p>
        </div>
        <label className="glass flex w-full max-w-sm items-center gap-3 rounded-xl px-3 py-2.5">
          <Search className="size-4 text-teal" />
          <span className="sr-only">{t("searchAria")}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaylists")}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </label>
      </header>

      <div className="mt-8 flex flex-wrap gap-2">
        <FilterChip active={stageFilter === "all"} onClick={() => setStageFilter("all")} label={t("filterAll")} />
        {stages.map((stage) => (
          <FilterChip
            key={stage.id}
            active={stageFilter === stage.id}
            onClick={() => setStageFilter(stage.id)}
            label={stageLabel(locale, stage.id, stage.title)}
          />
        ))}
      </div>

      <div className="mt-12 space-y-12">
        {grouped.map((group) => (
          <section key={group.gradeId}>
            <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-line pb-3">
              <div>
                <p className="text-xs text-teal">{stageLabel(locale, group.stageId, group.stageTitle)}</p>
                <h2 className="mt-1 text-2xl font-bold">{gradeLabel(locale, group.gradeId, group.gradeTitle)}</h2>
              </div>
              <Link to={`/grades/${group.gradeId}`} className="text-sm font-semibold text-teal">
                {t("gradeWorkspace")}
              </Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {group.items.map((lesson) => (
                <li key={lesson.id}>
                  <button
                    type="button"
                    onClick={() => setActive(lesson)}
                    className="glass group flex h-full w-full flex-col overflow-hidden rounded-2xl text-start transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(16,185,129,0.7)]"
                  >
                    <div className="relative aspect-video overflow-hidden bg-navy">
                      <img
                        src={`https://i.ytimg.com/vi_webp/fNk_zzaMoSs/maxresdefault.webp`}
                        alt=""
                        className="size-full object-cover opacity-80 transition duration-500 group-hover:scale-105"
                      />
                      <span className="brand-gradient absolute inset-0 m-auto flex size-14 items-center justify-center rounded-full text-white shadow-[0_16px_40px_-12px_rgba(16,185,129,1)]">
                        <Play className="size-5 fill-current ms-0.5" />
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-xs text-teal">
                        {lesson.subjectCode} · {subjectLabel(locale, lesson.subjectCode, lesson.subjectTitle)}
                      </p>
                      <h3 className="mt-2 text-xl font-bold">
                        {locale === "en" ? `Lesson · ${subjectLabel(locale, lesson.subjectCode, lesson.subjectTitle)}` : lesson.title}
                      </h3>
                      <span className="mt-4 text-sm font-semibold text-teal">{t("openPlayer")}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {grouped.length === 0 ? <p className="mt-8 text-sm leading-7 text-muted">{t("noResults")}</p> : null}

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
