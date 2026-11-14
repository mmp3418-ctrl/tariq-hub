import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Download, X } from "lucide-react";
import { useEffect } from "react";
import { gradeLabel, subjectLabel } from "../../i18n/content.ts";
import { usePreferences } from "../../lib/preferences.tsx";
import type { CatalogNote } from "../../services/types.ts";

export function PreviewDrawer({ note, onClose }: { note: CatalogNote | null; onClose: () => void }) {
  const reduce = useReducedMotion();
  const { t, locale } = usePreferences();

  useEffect(() => {
    if (!note) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [note, onClose]);

  return (
    <AnimatePresence>
      {note ? (
        <motion.div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" role="presentation">
          <motion.button
            type="button"
            aria-label={t("closePreview")}
            className="absolute inset-0 bg-navy/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-title"
            className="glass-strong relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl"
            initial={reduce ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: 20 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-white/10 bg-[#0F172A] px-5 py-4 text-white">
              <div>
                <p className="font-display text-[11px] tracking-[0.18em] text-emerald">
                  {note.kind === "ملخص" ? t("noteKindSummary") : t("noteKindWorksheet")} · {note.subjectCode}
                </p>
                <h2 id="preview-title" className="mt-1 text-xl font-bold text-white">
                  {locale === "en"
                    ? `${note.kind === "ملخص" ? t("noteKindSummary") : t("noteKindWorksheet")} ${subjectLabel(locale, note.subjectCode, note.subjectTitle)}`
                    : note.title}
                </h2>
                <p className="mt-1 text-sm text-soft">
                  {gradeLabel(locale, note.gradeId, note.gradeTitle)} · {subjectLabel(locale, note.subjectCode, note.subjectTitle)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={note.fileUrl}
                  download={note.fileName}
                  className="brand-gradient inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-white"
                >
                  <Download className="size-4" />
                  <span className="hidden sm:inline">{t("downloadDirect")}</span>
                </a>
                <button type="button" onClick={onClose} className="inline-flex size-10 items-center justify-center rounded-md text-white" aria-label={t("closePreview")}>
                  <X className="size-5" />
                </button>
              </div>
            </header>
            <iframe title={note.title} src={`${note.fileUrl}#view=FitH`} className="h-[72vh] min-h-[320px] w-full bg-white" />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
