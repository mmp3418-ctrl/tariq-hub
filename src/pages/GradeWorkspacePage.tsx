import { ChevronDown, Download, Play } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PreviewDrawer } from "../components/library/PreviewDrawer.tsx";
import { VideoPlayerModal } from "../components/study/VideoPlayerModal.tsx";
import { ComingSoonBadge } from "../components/ui/ComingSoonBadge.tsx";
import { MissingPath } from "../components/ui/MissingPath.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { gradeLabel, stageLabel } from "../i18n/content.ts";
import { categoryLabel, RESOURCE_CATEGORIES } from "../lib/resourceCategories.ts";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import {
  useGrade,
  useGradeLessons,
  useGradeNotes,
  useLessonsByUnit,
  useNotesByLesson,
  usePlaylistsByLesson,
  useStage,
  useUnitsByGrade,
} from "../services/hooks/useCurriculum.ts";
import type { CatalogLesson, CatalogNote } from "../services/types.ts";

function CategoryGroup({
  title,
  notes,
  playlists,
  onPreview,
  onPlay,
  t,
  locked,
}: {
  title: string;
  notes: CatalogNote[];
  playlists: CatalogLesson[];
  onPreview: (note: CatalogNote) => void;
  onPlay: (lesson: CatalogLesson) => void;
  t: (key: string) => string;
  locked?: boolean;
}) {
  if (notes.length === 0 && playlists.length === 0) return null;
  return (
    <div className="rounded-xl border border-line bg-white/60 p-3 dark:bg-slate-950/40">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-teal">{title}</span>
        {locked ? <ComingSoonBadge /> : null}
      </div>
      <ul className="space-y-2">
        {notes.map((note) => {
          const soon = locked || note.isComingSoon;
          return (
            <li key={note.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{note.title}</p>
                {soon ? <ComingSoonBadge className="mt-1" /> : null}
              </div>
              <div className="flex gap-3 text-xs font-semibold">
                <button
                  type="button"
                  disabled={soon}
                  onClick={() => onPreview(note)}
                  className="text-teal disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("quickPreview")}
                </button>
                {soon ? (
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <Download className="size-3.5" />
                    {t("download")}
                  </span>
                ) : (
                  <a href={note.fileUrl} download={note.fileName} className="inline-flex items-center gap-1">
                    <Download className="size-3.5" />
                    {t("download")}
                  </a>
                )}
              </div>
            </li>
          );
        })}
        {playlists.map((lesson) => {
          const soon = locked || lesson.isComingSoon;
          return (
            <li key={lesson.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{lesson.title}</p>
                {soon ? <ComingSoonBadge className="mt-1" /> : null}
              </div>
              <button
                type="button"
                disabled={soon}
                onClick={() => onPlay(lesson)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play className="size-3.5" />
                {t("openPlayer")}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function LessonBlock({
  lessonId,
  title,
  isComingSoon,
  onPreview,
  onPlay,
  t,
  locale,
}: {
  lessonId: string;
  title: string;
  isComingSoon: boolean;
  onPreview: (note: CatalogNote) => void;
  onPlay: (lesson: CatalogLesson) => void;
  t: (key: string) => string;
  locale: "ar" | "en";
}) {
  const notes = useNotesByLesson(lessonId);
  const playlists = usePlaylistsByLesson(lessonId);
  const [open, setOpen] = useState(true);

  const groups = useMemo(() => {
    return RESOURCE_CATEGORIES.map((category) => ({
      ...category,
      notes: notes.filter((note) => note.category === category.value),
      playlists: playlists.filter((item) => item.category === category.value),
    })).filter((group) => group.notes.length > 0 || group.playlists.length > 0);
  }, [notes, playlists]);

  const uncategorizedNotes = notes.filter((note) => !RESOURCE_CATEGORIES.some((c) => c.value === note.category));
  const uncategorizedPlaylists = playlists.filter(
    (item) => !RESOURCE_CATEGORIES.some((c) => c.value === item.category),
  );

  return (
    <div className="rounded-xl border border-line">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-start"
      >
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{title}</p>
          {isComingSoon ? <ComingSoonBadge /> : null}
        </div>
        <ChevronDown className={`size-4 shrink-0 text-teal transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="space-y-3 border-t border-line p-3">
          {groups.map((group) => (
            <CategoryGroup
              key={group.value}
              title={categoryLabel(group.value, t, locale)}
              notes={group.notes}
              playlists={group.playlists}
              onPreview={onPreview}
              onPlay={onPlay}
              t={t}
              locked={isComingSoon}
            />
          ))}
          {uncategorizedNotes.length > 0 || uncategorizedPlaylists.length > 0 ? (
            <CategoryGroup
              title={t("categoryOther")}
              notes={uncategorizedNotes}
              playlists={uncategorizedPlaylists}
              onPreview={onPreview}
              onPlay={onPlay}
              t={t}
              locked={isComingSoon}
            />
          ) : null}
          {groups.length === 0 && uncategorizedNotes.length === 0 && uncategorizedPlaylists.length === 0 ? (
            <p className="text-sm text-muted">{t("noResults")}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function UnitBlock({
  unitId,
  title,
  isComingSoon,
  onPreview,
  onPlay,
  t,
  locale,
}: {
  unitId: string;
  title: string;
  isComingSoon: boolean;
  onPreview: (note: CatalogNote) => void;
  onPlay: (lesson: CatalogLesson) => void;
  t: (key: string) => string;
  locale: "ar" | "en";
}) {
  const lessons = useLessonsByUnit(unitId);
  const [open, setOpen] = useState(true);

  return (
    <section className="glass overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-start sm:px-5"
      >
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          {isComingSoon ? <ComingSoonBadge /> : null}
        </div>
        <ChevronDown className={`size-4 shrink-0 text-teal transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="space-y-3 border-t border-line px-4 py-4 sm:px-5">
          <p className="text-xs font-semibold text-teal">{t("lessonsTitle")}</p>
          {lessons.length === 0 ? (
            <p className="text-sm text-muted">{t("noLessons")}</p>
          ) : (
            lessons.map((lesson) => (
              <LessonBlock
                key={lesson.id}
                lessonId={lesson.id}
                title={lesson.title}
                isComingSoon={isComingSoon || lesson.isComingSoon}
                onPreview={onPreview}
                onPlay={onPlay}
                t={t}
                locale={locale}
              />
            ))
          )}
        </div>
      ) : null}
    </section>
  );
}

export function GradeWorkspacePage() {
  const { gradeId = "" } = useParams();
  const grade = useGrade(gradeId);
  const stage = useStage(grade?.stageId ?? "");
  const units = useUnitsByGrade(gradeId);
  const fallbackNotes = useGradeNotes(gradeId);
  const fallbackPlaylists = useGradeLessons(gradeId);
  const [preview, setPreview] = useState<CatalogNote | null>(null);
  const [active, setActive] = useState<CatalogLesson | null>(null);
  const { t, locale } = usePreferences();
  usePageTitle(grade ? gradeLabel(locale, grade.id, grade.title) : t("missingGrade"));

  if (!grade) {
    return <MissingPath title={t("missingGrade")} body={t("missingGradeBody")} />;
  }

  const gradeLocked = Boolean(grade.isComingSoon);

  return (
    <div className="overflow-x-hidden pb-20">
      <section className="surface-dark mx-3 overflow-hidden rounded-2xl sm:mx-5">
        <Shell className="py-10 sm:py-14">
          <Link to={`/grades?stage=${grade.stageId}`} className="text-sm text-soft transition-colors hover:text-white">
            {stage ? stageLabel(locale, stage.id, stage.title) : t("grades")}
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <p className="font-display text-xs tracking-[0.22em] text-emerald">{grade.index}</p>
            {gradeLocked ? <ComingSoonBadge /> : null}
          </div>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-6xl">
            {gradeLabel(locale, grade.id, grade.title)}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-soft">
            {gradeLabel(locale, grade.id, grade.subtitle, "subtitle")}
          </p>
        </Shell>
      </section>

      <Shell className="pt-10">
        <div className="mb-5">
          <p className="text-sm text-teal">{t("unitsTitle")}</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{t("unitsTitle")}</h2>
        </div>

        {units.length > 0 ? (
          <div className="space-y-4">
            {units.map((unit) => (
              <UnitBlock
                key={unit.id}
                unitId={unit.id}
                title={unit.title}
                isComingSoon={gradeLocked || unit.isComingSoon}
                onPreview={setPreview}
                onPlay={setActive}
                t={t}
                locale={locale}
              />
            ))}
          </div>
        ) : (
          <div className="glass space-y-4 rounded-2xl p-5">
            <p className="text-sm text-muted">{t("noUnits")}</p>
            <CategoryGroup
              title={t("library")}
              notes={fallbackNotes}
              playlists={[]}
              onPreview={setPreview}
              onPlay={setActive}
              t={t}
              locked={gradeLocked}
            />
            <CategoryGroup
              title={t("playlists")}
              notes={[]}
              playlists={fallbackPlaylists}
              onPreview={setPreview}
              onPlay={setActive}
              t={t}
              locked={gradeLocked}
            />
          </div>
        )}
      </Shell>

      <PreviewDrawer note={preview} onClose={() => setPreview(null)} />
      <VideoPlayerModal
        lesson={active}
        meta={active ? `${active.gradeTitle} · ${active.subjectTitle}` : ""}
        onClose={() => setActive(null)}
        closeLabel={t("closePlayer")}
      />
    </div>
  );
}
