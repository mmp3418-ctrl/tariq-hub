import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { TeacherPortalBanner } from "../components/teacher/TeacherPortalBanner.tsx";
import { PreviewDrawer } from "../components/library/PreviewDrawer.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { gradeLabel, stageLabel, subjectLabel } from "../i18n/content.ts";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import { useCatalogNotes, useStages } from "../services/hooks/useCurriculum.ts";
import type { CatalogNote } from "../services/types.ts";

export function TeacherLibraryPage() {
  const notes = useCatalogNotes();
  const stages = useStages();
  const { t, locale } = usePreferences();
  const [preview, setPreview] = useState<CatalogNote | null>(null);
  usePageTitle(`${t("teacherPortalBadge")} · ${t("library")}`);

  const grouped = useMemo(() => {
    return stages.map((stage) => {
      const stageNotes = notes.filter((note) => note.stageId === stage.id);
      const byGrade = new Map<string, CatalogNote[]>();
      for (const note of stageNotes) {
        const list = byGrade.get(note.gradeId) ?? [];
        list.push(note);
        byGrade.set(note.gradeId, list);
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
  }, [notes, stages]);

  return (
    <Shell className="pb-20">
      <Folio index="05" label={t("folioTeacher")} />
      <TeacherPortalBanner />

      <header className="glass max-w-3xl rounded-2xl p-5 sm:p-7">
        <p className="text-sm text-teal">{t("teacherAllLibrary")}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">{t("library")}</h1>
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
                <div key={group.gradeId} className="glass overflow-hidden rounded-2xl">
                  <div className="border-b border-line px-4 py-3 sm:px-5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {gradeLabel(locale, group.gradeId, group.gradeTitle)}
                    </h3>
                  </div>
                  <ul className="divide-y divide-line">
                    {group.items.map((note) => (
                      <li key={note.id} className="grid gap-3 px-4 py-4 sm:grid-cols-12 sm:items-center sm:px-5">
                        <div className="sm:col-span-7">
                          <p className="font-display text-xs tracking-[0.14em] text-teal">{note.subjectCode}</p>
                          <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                            {locale === "en"
                              ? `${note.kind === "ملخص" ? t("noteKindSummary") : t("noteKindWorksheet")} ${subjectLabel(locale, note.subjectCode, note.subjectTitle)}`
                              : note.title}
                          </p>
                        </div>
                        <div className="flex gap-4 text-sm font-semibold sm:col-span-5 sm:justify-end">
                          <button type="button" onClick={() => setPreview(note)} className="text-teal">
                            {t("quickPreview")}
                          </button>
                          <a
                            href={note.fileUrl}
                            download={note.fileName}
                            className="inline-flex items-center gap-1.5 text-slate-900 dark:text-white"
                          >
                            <Download className="size-4" />
                            {t("downloadDirect")}
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </section>
        ))}
      </div>

      <PreviewDrawer note={preview} onClose={() => setPreview(null)} />
    </Shell>
  );
}
