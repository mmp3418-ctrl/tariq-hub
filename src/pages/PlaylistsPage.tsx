import { useMemo, useState } from "react";
import { ResourceCard } from "../components/catalog/ResourceCard.tsx";
import { StageGradeFlow, type FlowStep } from "../components/catalog/StageGradeFlow.tsx";
import { TermFilter } from "../components/catalog/TermFilter.tsx";
import { VideoPlayerModal } from "../components/study/VideoPlayerModal.tsx";
import { CatalogSkeleton } from "../components/ui/CatalogSkeleton.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { gradeLabel, subjectLabel } from "../i18n/content.ts";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import { useCatalogLessons, useCatalogSource } from "../services/hooks/useCurriculum.ts";
import type { CatalogLesson, StageId } from "../services/types.ts";

export function PlaylistsPage() {
  const lessons = useCatalogLessons();
  const { ready } = useCatalogSource();
  const { t, locale } = usePreferences();
  const [step, setStep] = useState<FlowStep>("stages");
  const [stageId, setStageId] = useState<StageId | null>(null);
  const [gradeId, setGradeId] = useState<string | null>(null);
  const [term, setTerm] = useState<string | null>(null);
  const [active, setActive] = useState<CatalogLesson | null>(null);
  usePageTitle(t("playlists"));

  const gradeLessons = useMemo(
    () => (gradeId ? lessons.filter((lesson) => lesson.gradeId === gradeId) : []),
    [gradeId, lessons],
  );
  const terms = useMemo(() => gradeLessons.map((lesson) => lesson.detail), [gradeLessons]);
  const filteredLessons = useMemo(
    () => (term ? gradeLessons.filter((lesson) => lesson.detail === term) : gradeLessons),
    [gradeLessons, term],
  );

  return (
    <Shell className="overflow-x-hidden pb-20">
      <Folio index="04" label={t("folioPlaylists")} />
      <header className="glass max-w-3xl rounded-2xl p-5 pt-7 sm:p-8 sm:pt-10">
        <p className="text-sm text-teal">{t("playlistsKind")}</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl lg:text-6xl">{t("playlistsHeading")}</h1>
        <p className="mt-4 text-sm leading-7 text-muted sm:mt-5 sm:text-base sm:leading-8">{t("playlistsLead")}</p>
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
          onSelectStage={(id) => {
            setStageId(id);
            setGradeId(null);
            setTerm(null);
            setStep("grades");
          }}
          onSelectGrade={(id) => {
            setGradeId(id);
            setTerm(null);
            setStep("content");
          }}
          onBackToStages={() => {
            setStageId(null);
            setGradeId(null);
            setTerm(null);
            setStep("stages");
          }}
          onBackToGrades={() => {
            setGradeId(null);
            setTerm(null);
            setStep("grades");
          }}
          emptyLabel={t("noResults")}
          content={
            gradeLessons.length === 0 ? (
              <p className="text-sm leading-7 text-muted">{t("noGradePlaylists")}</p>
            ) : (
              <div className="min-w-0">
                <TermFilter terms={terms} value={term} onChange={setTerm} />
                {filteredLessons.length === 0 ? (
                  <p className="text-sm leading-7 text-muted">{t("noResults")}</p>
                ) : (
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {filteredLessons.map((lesson) => (
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
                        />
                      </li>
                    ))}
                  </ul>
                )}
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
