import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Download, Maximize2, Minimize2, Minus, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { gradeLabel, subjectLabel } from "../../i18n/content.ts";
import { usePreferences } from "../../lib/preferences.tsx";
import type { CatalogNote } from "../../services/types.ts";

export function PreviewDrawer({ note, onClose }: { note: CatalogNote | null; onClose: () => void }) {
  const reduce = useReducedMotion();
  const { t, locale } = usePreferences();
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!note) {
      setZoom(100);
      setFullscreen(false);
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (fullscreen) setFullscreen(false);
        else onClose();
      }
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [fullscreen, note, onClose]);

  return (
    <AnimatePresence>
      {note ? (
        <motion.div
          className={`fixed inset-0 z-[90] flex justify-center ${fullscreen ? "items-stretch p-0" : "items-end p-0 sm:items-center sm:p-4"}`}
          role="presentation"
        >
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
            className={`relative flex w-full max-w-[100vw] flex-col overflow-hidden border border-white/20 bg-white/95 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 ${
              fullscreen
                ? "h-svh max-h-svh max-w-none rounded-none"
                : "max-h-[92svh] max-w-4xl rounded-t-2xl sm:rounded-2xl"
            }`}
            initial={reduce ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: 20 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex items-start justify-between gap-3 border-b border-white/10 bg-[#0F172A] px-3 py-3 text-white sm:px-5 sm:py-4">
              <div className="min-w-0 flex-1">
                <p className="font-display text-[11px] tracking-[0.18em] text-emerald">
                  {t("quickPreview")} · {note.subjectCode}
                </p>
                <h2 id="preview-title" className="mt-1 line-clamp-2 text-base font-bold text-white sm:truncate sm:text-xl">
                  {locale === "en"
                    ? `${note.kind === "ملخص" ? t("noteKindSummary") : t("noteKindWorksheet")} ${subjectLabel(locale, note.subjectCode, note.subjectTitle)}`
                    : note.title}
                </h2>
                <p className="mt-1 truncate text-sm text-soft">
                  {gradeLabel(locale, note.gradeId, note.gradeTitle)} · {subjectLabel(locale, note.subjectCode, note.subjectTitle)}
                </p>
              </div>
              <div className="flex max-w-[55%] shrink-0 flex-wrap items-center justify-end gap-1 sm:max-w-none sm:gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoom((value) => Math.max(75, value - 25))}
                  className="inline-flex size-10 items-center justify-center rounded-lg text-white hover:bg-white/10"
                  aria-label={t("zoomOut")}
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-12 text-center font-display text-xs text-white/80">{zoom}%</span>
                <button
                  type="button"
                  onClick={() => setZoom((value) => Math.min(175, value + 25))}
                  className="inline-flex size-10 items-center justify-center rounded-lg text-white hover:bg-white/10"
                  aria-label={t("zoomIn")}
                >
                  <Plus className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setFullscreen((value) => !value)}
                  className="inline-flex size-10 items-center justify-center rounded-lg text-white hover:bg-white/10"
                  aria-label={fullscreen ? t("exitFullscreen") : t("enterFullscreen")}
                >
                  {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                </button>
                <a
                  href={note.fileUrl}
                  download={note.fileName}
                  className="brand-gradient inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white"
                >
                  <Download className="size-4" />
                  <span className="hidden sm:inline">{t("downloadDirect")}</span>
                </a>
                <button type="button" onClick={onClose} className="inline-flex size-10 items-center justify-center rounded-lg text-white hover:bg-white/10" aria-label={t("closePreview")}>
                  <X className="size-5" />
                </button>
              </div>
            </header>
            <div className="relative min-h-0 flex-1 overflow-auto overscroll-contain bg-slate-100 touch-pan-y dark:bg-slate-900">
              <div
                className="mx-auto origin-top transition-transform"
                style={{ width: `${Math.min(zoom, 100)}%`, minWidth: "100%", minHeight: "100%" }}
              >
                <iframe
                  title={note.title}
                  src={`${note.fileUrl}#view=FitH`}
                  className={`w-full max-w-full bg-white ${fullscreen ? "h-[calc(100svh-4.5rem)]" : "h-[68svh] min-h-[280px] sm:h-[72vh] sm:min-h-[320px]"}`}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
