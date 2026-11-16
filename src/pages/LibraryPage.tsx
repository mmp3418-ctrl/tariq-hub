import { useMemo, useState } from "react";
import { ResourceCard, ResourceDownloadAction } from "../components/catalog/ResourceCard.tsx";
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
    <Shell className="overflow-x-hidden pb-20">
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
              <div className="min-w-0">
                <TermFilter terms={terms} value={term} onChange={setTerm} />
                {filteredNotes.length === 0 ? (
                  <p className="text-sm leading-7 text-muted">{t("noResults")}</p>
                ) : (
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {filteredNotes.map((note) => (
                      <li key={note.id} className="min-w-0">
                        <ResourceCard
                          variant="pdf"
                          title={
                            locale === "en"
                              ? `${note.kind === "ملخص" ? t("noteKindSummary") : t("noteKindWorksheet")} ${subjectLabel(locale, note.subjectCode, note.subjectTitle)}`
                              : note.title
                          }
                          meta={`${note.subjectCode} · ${subjectLabel(locale, note.subjectCode, note.subjectTitle)}`}
                          description={note.description}
                          coverImage={note.coverImage}
                          cardColor={note.cardColor}
                          iconName={note.iconName}
                          term={note.detail}
                          isComingSoon={note.isComingSoon}
                          onOpen={() => setPreview(note)}
                          actions={
                            <ResourceDownloadAction
                              href={note.fileUrl}
                              fileName={note.fileName}
                              label={t("downloadDirect")}
                            />
                          }
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

      <PreviewDrawer note={preview} onClose={() => setPreview(null)} />
    </Shell>
  );
}
