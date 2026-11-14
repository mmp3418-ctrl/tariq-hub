import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BookOpen, Clapperboard, CornerDownLeft, Layers, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "../../lib/preferences.tsx";
import { useSearch } from "../../lib/search.tsx";
import { useCatalogLessons, useCatalogNotes, useGrades } from "../../services/hooks/useCurriculum.ts";

type Category = "all" | "pdf" | "playlist" | "grade";

type Hit = {
  id: string;
  category: Exclude<Category, "all">;
  title: string;
  meta: string;
  href: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function highlight(text: string, query: string) {
  if (!query) return text;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-emerald/25 px-0.5 text-inherit">{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}

export function SpotlightSearch() {
  const { open, closeSearch } = useSearch();
  const { t, locale, dir } = usePreferences();
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const grades = useGrades();
  const notes = useCatalogNotes();
  const lessons = useCatalogLessons();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [active, setActive] = useState(0);

  const index = useMemo<Hit[]>(() => {
    const gradeHits: Hit[] = grades.map((grade) => ({
      id: `grade-${grade.id}`,
      category: "grade",
      title: grade.title,
      meta: grade.subtitle,
      href: `/grades/${grade.id}`,
    }));
    const noteHits: Hit[] = notes.map((note) => ({
      id: `pdf-${note.id}`,
      category: "pdf",
      title: note.title,
      meta: `${note.gradeTitle} · ${note.subjectTitle}`,
      href: "/library",
    }));
    const lessonHits: Hit[] = lessons.map((lesson) => ({
      id: `pl-${lesson.id}`,
      category: "playlist",
      title: lesson.title,
      meta: `${lesson.gradeTitle} · ${lesson.subjectTitle}`,
      href: "/playlists",
    }));
    return [...gradeHits, ...noteHits, ...lessonHits];
  }, [grades, lessons, notes]);

  const pills: { id: Category; label: string }[] = [
    { id: "all", label: t("searchAll") },
    { id: "pdf", label: t("searchPdfs") },
    { id: "playlist", label: t("searchVideos") },
    { id: "grade", label: t("searchStages") },
  ];

  const results = useMemo(() => {
    const needle = normalize(query);
    return index.filter((hit) => {
      if (category !== "all" && hit.category !== category) return false;
      if (!needle) return true;
      return normalize(`${hit.title} ${hit.meta}`).includes(needle);
    }).slice(0, 12);
  }, [category, index, query]);

  useEffect(() => {
    setActive(0);
  }, [query, category, open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setCategory("all");
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(timer);
    };
  }, [open]);

  const go = (hit: Hit) => {
    closeSearch();
    navigate(hit.href);
  };

  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => Math.min(value + 1, Math.max(results.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => Math.max(value - 1, 0));
      return;
    }
    if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      go(results[active]);
    }
  };

  const iconFor = (category: Hit["category"]) => {
    if (category === "pdf") return BookOpen;
    if (category === "playlist") return Clapperboard;
    return Layers;
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[100] flex items-start justify-center px-3 pt-[12vh] sm:px-6" role="presentation">
          <motion.button
            type="button"
            aria-label={t("closeSearch")}
            className="absolute inset-0 bg-ink/50 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t("spotlightTitle")}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-white/90 shadow-[0_30px_80px_-24px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-ink/92"
            initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <Search className="size-5 shrink-0 text-teal" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("spotlightPlaceholder")}
                className="w-full bg-transparent text-base text-fg outline-none placeholder:text-muted"
                dir={dir}
              />
              <kbd className="hidden rounded-md border border-line px-2 py-1 font-display text-[10px] tracking-wide text-muted sm:inline">
                ESC
              </kbd>
              <button type="button" onClick={closeSearch} className="inline-flex size-9 items-center justify-center rounded-lg text-muted hover:bg-emerald/10 hover:text-fg" aria-label={t("closeSearch")}>
                <X className="size-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-line px-4 py-3">
              {pills.map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setCategory(pill.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    category === pill.id
                      ? "brand-gradient text-white shadow-[0_8px_20px_-10px_rgba(16,185,129,0.9)]"
                      : "border border-line bg-surface text-muted hover:text-fg"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <ul className="max-h-[min(52vh,420px)] overflow-y-auto p-2" role="listbox">
              {results.length === 0 ? (
                <li className="px-4 py-10 text-center text-sm text-muted">{t("spotlightEmpty")}</li>
              ) : (
                results.map((hit, index) => {
                  const Icon = iconFor(hit.category);
                  const selected = index === active;
                  return (
                    <li key={hit.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => go(hit)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start transition ${
                          selected ? "bg-emerald/12 text-fg" : "text-fg hover:bg-emerald/10"
                        }`}
                      >
                        <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl ${selected ? "brand-gradient text-white" : "bg-emerald/10 text-teal"}`}>
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold">{highlight(hit.title, query)}</span>
                          <span className="mt-0.5 block truncate text-xs text-muted">{highlight(hit.meta, query)}</span>
                        </span>
                        {selected ? <CornerDownLeft className="size-4 shrink-0 text-teal" /> : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>

            <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5 text-[11px] text-muted">
              <span>{locale === "ar" ? "↑↓ للتنقل · Enter للفتح" : "↑↓ navigate · Enter open"}</span>
              <span className="font-display tracking-wide">{index.length} {t("spotlightIndexed")}</span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
