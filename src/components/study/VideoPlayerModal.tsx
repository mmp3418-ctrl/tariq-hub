import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import type { CatalogLesson } from "../../services/types.ts";
import { PlaylistPlayer } from "./PlaylistPlayer.tsx";

export function VideoPlayerModal({
  lesson,
  meta,
  onClose,
  closeLabel,
}: {
  lesson: CatalogLesson | null;
  meta: string;
  onClose: () => void;
  closeLabel: string;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!lesson) return;
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
  }, [lesson, onClose]);

  return (
    <AnimatePresence>
      {lesson ? (
        <motion.div className="fixed inset-0 z-[90] flex items-end justify-center overflow-x-hidden sm:items-center" role="presentation">
          <motion.button
            type="button"
            aria-label={closeLabel}
            className="absolute inset-0 bg-navy/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="player-title"
            className="glass-strong relative w-full max-w-[min(56rem,100vw)] overflow-hidden rounded-t-2xl sm:rounded-2xl"
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex items-start justify-between gap-3 border-b border-white/10 bg-[#0F172A] px-4 py-3 text-white sm:gap-4 sm:px-5 sm:py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[11px] tracking-[0.18em] text-emerald">{meta}</p>
                <h2 id="player-title" className="mt-1 line-clamp-2 text-lg font-bold text-white sm:text-xl">
                  {lesson.title}
                </h2>
              </div>
              <button type="button" onClick={onClose} className="inline-flex size-10 items-center justify-center rounded-md text-white" aria-label={closeLabel}>
                <X className="size-5" />
              </button>
            </header>
            <PlaylistPlayer playlistId={lesson.playlistId} title={lesson.title} />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
