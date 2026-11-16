import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { StageGradeFlow, type FlowStep } from "../components/catalog/StageGradeFlow.tsx";
import { TermFilter } from "../components/catalog/TermFilter.tsx";
import { PreviewDrawer } from "../components/library/PreviewDrawer.tsx";
import { CatalogSkeleton } from "../components/ui/CatalogSkeleton.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { subjectLabel } from "../i18n/content.ts";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import { useCatalogNotes, useCatalogSource } from "../services/hooks/useCurriculum.ts";
import type { CatalogNote, StageId } from "../services/types.ts";

export function LibraryPage() {
  const notes = useCatalogNotes();
  const { ready } = useCatalogSource();
  const { t, locale } = usePreferences();
  const [step, setStep] = useState<FlowStep>("stages");
  const [stageId, setStageId] = useState<StageId | null>(null);
  const [gradeId, setGradeId] = useState<string | null>(null);
  const [term, setTerm] = useState<string | null>(null);
  const [preview, setPreview] = useState<CatalogNote | null>(null);
  usePageTitle(t("library"));

  const gradeNotes = useMemo(
    () => (gradeId ? notes.filter((note) => note.gradeId === gradeId) : []),
    [gradeId, notes],
  );
  const terms = useMemo(() => gradeNotes.map((note) => note.detail), [gradeNotes]);
  const filteredNotes = useMemo(
    () => (term ? gradeNotes.filter((note) => note.detail === term) : gradeNotes),
    [gradeNotes, term],
  );

  return (
    <Shell className="pb-20">
      <Folio index="03" label={t("folioLibrary")} />
      <header className="glass max-w-3xl rounded-2xl p-5 pt-7 sm:p-8 sm:pt-10">
        <p className="text-sm text-teal">{t("libraryKind")}</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl lg:text-6xl">{t("library")}</h1>
        <p className="mt-4 text-sm leading-7 text-muted sm:mt-5 sm:text-base sm:leading-8">{t("libraryLead")}</p>
      </header>

      {!ready ? (
        <div>
          <p className="sr-only">{t("loadingCatalog")}</p>
          <CatalogSkeleton rows={3} />
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
            gradeNotes.length === 0 ? (
              <p className="text-sm leading-7 text-muted">{t("noGradeNotes")}</p>
            ) : (
              <div>
                <TermFilter terms={terms} value={term} onChange={setTerm} />
                {filteredNotes.length === 0 ? (
                  <p className="text-sm leading-7 text-muted">{t("noResults")}</p>
                ) : (
                  <ul className="glass divide-y divide-line overflow-hidden rounded-2xl">
                    {filteredNotes.map((note) => (
                      <li key={note.id} className="grid gap-4 px-4 py-5 sm:grid-cols-12 sm:items-center sm:px-5">
                        <div className="sm:col-span-2">
                          <p className="font-display text-xs tracking-[0.16em] text-teal">{note.subjectCode}</p>
                          <p className="mt-2 text-sm text-muted">
                            {note.kind === "ملخص" ? t("noteKindSummary") : t("noteKindWorksheet")}
                          </p>
                          {note.detail ? <p className="mt-1 text-xs text-teal">{note.detail}</p> : null}
                        </div>
                        <div className="sm:col-span-6">
                          <h3 className="text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
                            {locale === "en"
                              ? `${note.kind === "ملخص" ? t("noteKindSummary") : t("noteKindWorksheet")} ${subjectLabel(locale, note.subjectCode, note.subjectTitle)}`
                              : note.title}
                          </h3>
                          <p className="mt-1 text-sm text-muted">
                            {subjectLabel(locale, note.subjectCode, note.subjectTitle)}
                          </p>
                        </div>
                        <div className="flex gap-5 text-sm font-semibold sm:col-span-4 sm:justify-end">
                          <button type="button" onClick={() => setPreview(note)} className="text-teal">
                            {t("quickPreview")}
                          </button>
                          <a
                            href={note.fileUrl}
                            download={note.fileName}
                            className="inline-flex items-center gap-2 text-slate-900 dark:text-white"
                          >
                            <Download className="size-4" />
                            {t("downloadDirect")}
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          }
        />
      )}

      <PreviewDrawer note={preview} onClose={() => setPreview(null)} />
    </Shell>
  );
}
