import { Download } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PreviewDrawer } from "../components/library/PreviewDrawer.tsx";
import { DeskFrame } from "../components/study/DeskFrame.tsx";
import { PlaylistPlayer } from "../components/study/PlaylistPlayer.tsx";
import { MissingPath } from "../components/ui/MissingPath.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { gradeLabel, stageLabel, subjectLabel } from "../i18n/content.ts";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import {
  useGrade,
  useGradeLessons,
  useGradeNotes,
  useStage,
} from "../services/hooks/useCurriculum.ts";
import type { CatalogNote } from "../services/types.ts";

export function GradeWorkspacePage() {
  const { gradeId = "" } = useParams();
  const grade = useGrade(gradeId);
  const stage = useStage(grade?.stageId ?? "");
  const notes = useGradeNotes(gradeId);
  const lessons = useGradeLessons(gradeId);
  const [preview, setPreview] = useState<CatalogNote | null>(null);
  const { t, locale } = usePreferences();
  usePageTitle(grade ? gradeLabel(locale, grade.id, grade.title) : t("missingGrade"));

  if (!grade) {
    return <MissingPath title={t("missingGrade")} body={t("missingGradeBody")} />;
  }

  return (
    <div className="pb-20">
      <section className="surface-dark mx-3 overflow-hidden rounded-2xl sm:mx-5">
        <Shell className="py-10 sm:py-14">
          <Link to={`/grades?stage=${grade.stageId}`} className="text-sm text-soft transition-colors hover:text-white">
            {stage ? stageLabel(locale, stage.id, stage.title) : t("grades")}
          </Link>
          <p className="mt-8 font-display text-xs tracking-[0.22em] text-emerald">{grade.index}</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-6xl">{gradeLabel(locale, grade.id, grade.title)}</h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-soft">
            {gradeLabel(locale, grade.id, grade.subtitle, "subtitle")}
          </p>
        </Shell>
      </section>

      <Shell className="pt-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="glass rounded-2xl p-5 sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-teal">{t("library")}</p>
                <h2 className="mt-2 text-2xl font-bold">{t("workspaceNotes")}</h2>
              </div>
              <Link to="/library" className="text-sm font-semibold text-teal">
                {t("fullLibrary")}
              </Link>
            </div>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {notes.map((note) => (
                <li key={note.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-teal">
                      {note.kind === "ملخص" ? t("noteKindSummary") : t("noteKindWorksheet")} · {note.subjectCode}
                    </p>
                    <p className="mt-1 font-semibold">
                      {locale === "en"
                        ? `${note.kind === "ملخص" ? t("noteKindSummary") : t("noteKindWorksheet")} ${subjectLabel(locale, note.subjectCode, note.subjectTitle)}`
                        : note.title}
                    </p>
                    <p className="text-sm text-muted">
                      {subjectLabel(locale, note.subjectCode, note.subjectTitle)}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm font-semibold">
                    <button type="button" onClick={() => setPreview(note)} className="text-teal">
                      {t("quickPreview")}
                    </button>
                    <a href={note.fileUrl} download={note.fileName} className="inline-flex items-center gap-1">
                      <Download className="size-3.5" />
                      {t("download")}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
            {notes.length === 0 ? <p className="mt-4 text-sm text-muted">{t("noGradeNotes")}</p> : null}
          </section>

          <section className="glass rounded-2xl p-5 sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-teal">{t("playlists")}</p>
                <h2 className="mt-2 text-2xl font-bold">{t("workspacePlaylists")}</h2>
              </div>
              <Link to="/playlists" className="text-sm font-semibold text-teal">
                {t("fullPlaylists")}
              </Link>
            </div>
            <div className="mt-6 space-y-6">
              {lessons.map((lesson) => (
                <DeskFrame
                  key={lesson.id}
                  kicker={lesson.subjectCode}
                  caption={subjectLabel(locale, lesson.subjectCode, lesson.subjectTitle)}
                >
                  <PlaylistPlayer playlistId={lesson.playlistId} title={lesson.title} />
                </DeskFrame>
              ))}
            </div>
            {lessons.length === 0 ? <p className="mt-4 text-sm text-muted">{t("noGradePlaylists")}</p> : null}
          </section>
        </div>
      </Shell>

      <PreviewDrawer note={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
