import { Play } from "lucide-react";
import { useMemo, useState } from "react";
import { TeacherPortalBanner } from "../components/teacher/TeacherPortalBanner.tsx";
import { VideoPlayerModal } from "../components/study/VideoPlayerModal.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { gradeLabel, stageLabel, subjectLabel } from "../i18n/content.ts";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import { useCatalogLessons, useStages } from "../services/hooks/useCurriculum.ts";
import type { CatalogLesson } from "../services/types.ts";

export function TeacherPlaylistsPage() {
  const lessons = useCatalogLessons();
  const stages = useStages();
  const { t, locale } = usePreferences();
  const [active, setActive] = useState<CatalogLesson | null>(null);
  usePageTitle(`${t("teacherPortalBadge")} · ${t("playlists")}`);

  const grouped = useMemo(() => {
    return stages.map((stage) => {
      const stageLessons = lessons.filter((lesson) => lesson.stageId === stage.id);
      const byGrade = new Map<string, CatalogLesson[]>();
      for (const lesson of stageLessons) {
        const list = byGrade.get(lesson.gradeId) ?? [];
        list.push(lesson);
        byGrade.set(lesson.gradeId, list);
      }
      return {
        stage,
        grades: [...byGrade.entries()].map(([gradeId, items]) => ({
          gradeId,
          gradeTitle: items[0]?.gradeTitle ?? gradeId,
          items,
        })),
      };
    });
  }, [lessons, stages]);

  return (
    <Shell className="pb-20">
      <Folio index="05" label={t("folioTeacher")} />
      <TeacherPortalBanner />

      <header className="glass max-w-3xl rounded-2xl p-5 sm:p-7">
        <p className="text-sm text-teal">{t("teacherAllPlaylists")}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">{t("playlistsHeading")}</h1>
        <p className="mt-3 text-sm leading-7 text-muted">{t("teacherCatalogLead")}</p>
      </header>

      <div className="mt-8 space-y-8">
        {grouped.map(({ stage, grades }) => (
          <section key={stage.id} className="space-y-4">
            <div>
              <p className="font-display text-xs tracking-[0.16em] text-teal">{stage.index}</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {stageLabel(locale, stage.id, stage.title)}
              </h2>
            </div>
            {grades.length === 0 ? (
              <p className="text-sm text-muted">{t("noResults")}</p>
            ) : (
              grades.map((group) => (
                <div key={group.gradeId}>
                  <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
                    {gradeLabel(locale, group.gradeId, group.gradeTitle)}
                  </h3>
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {group.items.map((lesson) => (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          onClick={() => setActive(lesson)}
                          className="glass group flex h-full w-full flex-col overflow-hidden rounded-2xl text-start transition hover:-translate-y-0.5"
                        >
                          <div className="relative aspect-video overflow-hidden bg-navy">
                            <img
                              src="https://i.ytimg.com/vi_webp/fNk_zzaMoSs/maxresdefault.webp"
                              alt=""
                              className="size-full object-cover opacity-80 transition duration-500 group-hover:scale-105"
                            />
                            <span className="brand-gradient absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full text-white">
                              <Play className="ms-0.5 size-4 fill-current" />
                            </span>
                          </div>
                          <div className="p-4">
                            <p className="text-xs text-teal">
                              {lesson.subjectCode} · {subjectLabel(locale, lesson.subjectCode, lesson.subjectTitle)}
                            </p>
                            <h4 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                              {locale === "en"
                                ? `Lesson · ${subjectLabel(locale, lesson.subjectCode, lesson.subjectTitle)}`
                                : lesson.title}
                            </h4>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </section>
        ))}
      </div>

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
