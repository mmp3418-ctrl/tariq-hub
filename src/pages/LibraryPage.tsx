import { Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PreviewDrawer } from "../components/library/PreviewDrawer.tsx";
import { FilterChip } from "../components/ui/FilterChip.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { gradeLabel, stageLabel, subjectLabel } from "../i18n/content.ts";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import { useCatalogNotes, useStages } from "../services/hooks/useCurriculum.ts";
import type { CatalogNote, StageId } from "../services/types.ts";

export function LibraryPage() {
  const notes = useCatalogNotes();
  const stages = useStages();
  const { t, locale } = usePreferences();
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageId | "all">("all");
  const [preview, setPreview] = useState<CatalogNote | null>(null);
  usePageTitle(t("library"));

  const visible = useMemo(() => {
    const needle = query.trim();
    return notes.filter((note) => {
      if (stageFilter !== "all" && note.stageId !== stageFilter) return false;
      if (!needle) return true;
      return `${note.title} ${note.kind} ${note.subjectTitle} ${note.gradeTitle} ${note.stageTitle} ${note.subjectCode}`.includes(needle);
    });
  }, [notes, query, stageFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, { gradeTitle: string; stageTitle: string; gradeId: string; stageId: StageId; items: CatalogNote[] }>();
    for (const note of visible) {
      const current = map.get(note.gradeId);
      if (current) current.items.push(note);
      else {
        map.set(note.gradeId, {
          gradeTitle: note.gradeTitle,
          stageTitle: note.stageTitle,
          gradeId: note.gradeId,
          stageId: note.stageId,
          items: [note],
        });
      }
    }
    return [...map.values()];
  }, [visible]);

  return (
    <Shell className="pb-20">
      <Folio index="03" label={t("folioLibrary")} />
      <header className="glass flex flex-col gap-6 rounded-2xl p-5 pt-7 sm:gap-8 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm text-teal">{t("libraryKind")}</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl lg:text-6xl">{t("library")}</h1>
          <p className="mt-4 text-sm leading-7 text-muted sm:mt-5 sm:text-base sm:leading-8">{t("libraryLead")}</p>
        </div>
        <label className="glass flex w-full max-w-sm items-center gap-3 rounded-xl px-3 py-2.5">
          <Search className="size-4 text-teal" />
          <span className="sr-only">{t("searchAria")}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchLibrary")}
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
          <section key={group.gradeId} className="glass rounded-2xl p-5 sm:p-6">
            <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-line pb-3">
              <div>
                <p className="text-xs text-teal">{stageLabel(locale, group.stageId, group.stageTitle)}</p>
                <h2 className="mt-1 text-2xl font-bold">{gradeLabel(locale, group.gradeId, group.gradeTitle)}</h2>
              </div>
              <Link to={`/grades/${group.gradeId}`} className="text-sm font-semibold text-teal">
                {t("gradeWorkspace")}
              </Link>
            </div>
            <ul className="divide-y divide-line">
              {group.items.map((note) => (
                <li key={note.id} className="grid gap-4 py-5 sm:grid-cols-12 sm:items-center">
                  <div className="sm:col-span-2">
                    <p className="font-display text-xs tracking-[0.16em] text-teal">{note.subjectCode}</p>
                    <p className="mt-2 text-sm text-muted">
                      {note.kind === "ملخص" ? t("noteKindSummary") : t("noteKindWorksheet")}
                    </p>
                  </div>
                  <div className="sm:col-span-6">
                    <h3 className="text-xl font-bold">
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
                    <a href={note.fileUrl} download={note.fileName} className="inline-flex items-center gap-2">
                      <Download className="size-4" />
                      {t("downloadDirect")}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {grouped.length === 0 ? <p className="mt-8 text-sm leading-7 text-muted">{t("noResults")}</p> : null}

      <PreviewDrawer note={preview} onClose={() => setPreview(null)} />
    </Shell>
  );
}
