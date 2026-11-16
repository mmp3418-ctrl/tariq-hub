import { Play } from "lucide-react";
import { useMemo, useState } from "react";
import { StageGradeFlow, type FlowStep } from "../components/catalog/StageGradeFlow.tsx";
import { VideoPlayerModal } from "../components/study/VideoPlayerModal.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { gradeLabel, subjectLabel } from "../i18n/content.ts";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import { useCatalogLessons } from "../services/hooks/useCurriculum.ts";
import type { CatalogLesson, StageId } from "../services/types.ts";

export function PlaylistsPage() {
  const lessons = useCatalogLessons();
  const { t, locale } = usePreferences();
  const [step, setStep] = useState<FlowStep>("stages");
  const [stageId, setStageId] = useState<StageId | null>(null);
  const [gradeId, setGradeId] = useState<string | null>(null);
  const [active, setActive] = useState<CatalogLesson | null>(null);
  usePageTitle(t("playlists"));

  const gradeLessons = useMemo(
    () => (gradeId ? lessons.filter((lesson) => lesson.gradeId === gradeId) : []),
    [gradeId, lessons],
  );

  return (
    <Shell className="pb-20">
      <Folio index="04" label={t("folioPlaylists")} />
      <header className="glass max-w-3xl rounded-2xl p-5 pt-7 sm:p-8 sm:pt-10">
        <p className="text-sm text-teal">{t("playlistsKind")}</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl lg:text-6xl">{t("playlistsHeading")}</h1>
        <p className="mt-4 text-sm leading-7 text-muted sm:mt-5 sm:text-base sm:leading-8">{t("playlistsLead")}</p>
      </header>

      <StageGradeFlow
        step={step}
        stageId={stageId}
        gradeId={gradeId}
        onSelectStage={(id) => {
          setStageId(id);
          setGradeId(null);
          setStep("grades");
        }}
        onSelectGrade={(id) => {
          setGradeId(id);
          setStep("content");
        }}
        onBackToStages={() => {
          setStageId(null);
          setGradeId(null);
          setStep("stages");
        }}
        onBackToGrades={() => {
          setGradeId(null);
          setStep("grades");
        }}
        emptyLabel={t("noResults")}
        content={
          gradeLessons.length === 0 ? (
            <p className="text-sm leading-7 text-muted">{t("noGradePlaylists")}</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {gradeLessons.map((lesson) => (
                <li key={lesson.id}>
                  <button
                    type="button"
                    onClick={() => setActive(lesson)}
                    className="glass group flex h-full w-full flex-col overflow-hidden rounded-2xl text-start transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(16,185,129,0.7)]"
                  >
                    <div className="relative aspect-video overflow-hidden bg-navy">
                      <img
                        src="https://i.ytimg.com/vi_webp/fNk_zzaMoSs/maxresdefault.webp"
                        alt=""
                        className="size-full object-cover opacity-80 transition duration-500 group-hover:scale-105"
                      />
                      <span className="brand-gradient absolute inset-0 m-auto flex size-14 items-center justify-center rounded-full text-white shadow-[0_16px_40px_-12px_rgba(16,185,129,1)]">
                        <Play className="ms-0.5 size-5 fill-current" />
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-xs text-teal">
                        {lesson.subjectCode} · {subjectLabel(locale, lesson.subjectCode, lesson.subjectTitle)}
                      </p>
                      <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                        {locale === "en"
                          ? `Lesson · ${subjectLabel(locale, lesson.subjectCode, lesson.subjectTitle)}`
                          : lesson.title}
                      </h3>
                      <span className="mt-4 text-sm font-semibold text-teal">{t("openPlayer")}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )
        }
      />

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
