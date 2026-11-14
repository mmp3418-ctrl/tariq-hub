import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, Clapperboard, Layers, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { HeroBook3D } from "../components/brand/HeroBook3D.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { gradeLabel, stageLabel, subjectLabel } from "../i18n/content.ts";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import {
  useCatalogLessons,
  useCatalogNotes,
  useGradesByStage,
  usePulse,
  useStages,
} from "../services/hooks/useCurriculum.ts";
import type { StageId } from "../services/types.ts";

export function HomePage() {
  const stages = useStages();
  const pulse = usePulse();
  const notes = useCatalogNotes().slice(0, 4);
  const lessons = useCatalogLessons().slice(0, 2);
  const reduce = useReducedMotion();
  const { t, locale, dir } = usePreferences();
  const [openStage, setOpenStage] = useState<StageId | null>(null);
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  usePageTitle(t("brandName"));

  const features = [
    { icon: Layers, title: t("f1t"), text: t("f1d") },
    { icon: BookOpen, title: t("f2t"), text: t("f2d") },
    { icon: Clapperboard, title: t("f3t"), text: t("f3d") },
    { icon: Sparkles, title: t("f4t"), text: t("f4d") },
  ];

  const stats = [
    { label: t("statsStages"), value: pulse.stages },
    { label: t("statsGrades"), value: pulse.grades },
    { label: t("statsNotes"), value: pulse.notes },
    { label: t("statsPlaylists"), value: pulse.playlists },
  ];

  return (
    <div className="overflow-x-hidden pb-16">
      <Shell>
        <Folio index="01" label={t("folioHome")} />
      </Shell>

      <Shell className="mt-5">
        <section className="grid grid-cols-1 gap-4 lg:min-h-[calc(100svh-10rem)] lg:grid-cols-12 lg:gap-5">
          <div className="surface-dark relative isolate overflow-hidden rounded-2xl shadow-elevated lg:col-span-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(16,185,129,0.26),transparent_42%),radial-gradient(circle_at_92%_8%,rgba(255,255,255,0.08),transparent_34%)]" />
            <RouteDrawing reduce={Boolean(reduce)} />

            <div className="relative grid grid-cols-1 items-center gap-8 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-12 lg:gap-6 lg:px-10 lg:py-14 xl:px-12">
              <div className="order-2 flex min-w-0 flex-col justify-between gap-8 sm:gap-10 lg:order-1 lg:col-span-7">
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="font-display text-[11px] font-semibold tracking-[0.28em] text-emerald">TARIQ HUB</p>
                  <span className="rounded-full border border-emerald/40 bg-emerald/10 px-3 py-1 text-xs text-emerald">
                    {t("heroEyebrow")}
                  </span>
                </div>

                <div className="max-w-2xl">
                  <h1 className="text-3xl font-extrabold leading-[1.12] text-white md:text-5xl lg:text-6xl">
                    <span className="text-gradient">{t("heroTitle")}</span>
                  </h1>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-soft sm:mt-5 sm:text-base sm:leading-8 md:text-lg">
                    {t("heroLead")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                  <Link
                    to="/grades"
                    className="brand-gradient theme-ease inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_-16px_rgba(16,185,129,1)]"
                  >
                    {t("ctaGrades")}
                    <Arrow className="size-4" />
                  </Link>
                  <Link
                    to="/library"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white theme-ease hover:bg-white/15"
                  >
                    {t("ctaLibrary")}
                  </Link>
                  <Link
                    to="/playlists"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white theme-ease hover:bg-white/15"
                  >
                    {t("ctaPlaylists")}
                  </Link>
                </div>
              </div>

              <div className="order-1 lg:order-2 lg:col-span-5">
                <HeroBook3D className="py-1 sm:py-2 lg:py-3" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-4 lg:grid-cols-1 lg:grid-rows-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduce ? 0 : 0.06 * index, duration: 0.35 }}
                className="glass theme-ease flex min-h-[5.5rem] flex-col justify-end gap-2 rounded-2xl px-4 py-4 sm:px-5 sm:py-5 lg:flex-row lg:items-end lg:justify-between"
              >
                <span className="text-xs text-muted sm:text-sm">{stat.label}</span>
                <span className="font-display text-3xl font-bold text-gradient sm:text-4xl">{stat.value}</span>
              </motion.div>
            ))}
          </div>
        </section>
      </Shell>

      <section className="py-12 sm:py-16">
        <Shell>
          <div className="glass-strong rounded-2xl p-5 sm:p-8">
            <div className="max-w-2xl">
              <p className="text-sm text-teal">{t("whyTitle")}</p>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl md:text-4xl">{t("whyHeading")}</h2>
            </div>
            <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
              {features.map((feature) => (
                <li
                  key={feature.title}
                  className="glass theme-ease rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-24px_rgba(16,185,129,0.55)]"
                >
                  <feature.icon className="size-5 text-teal" />
                  <h3 className="mt-5 text-lg font-bold sm:text-xl">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">{feature.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </Shell>
      </section>

      <section className="pb-8">
        <Shell>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm text-teal">{t("quickSelect")}</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{t("stagesHeading")}</h2>
            </div>
            <Link to="/grades" className="hairline-link shrink-0 text-sm font-semibold">
              {t("allGrades")}
            </Link>
          </div>
          <div className="space-y-3">
            {stages.map((stage) => {
              const open = openStage === stage.id;
              return (
                <HomeStageSelect
                  key={stage.id}
                  open={open}
                  onToggle={() => setOpenStage(open ? null : stage.id)}
                  stageId={stage.id}
                  index={stage.index}
                  title={stageLabel(locale, stage.id, stage.title)}
                  summary={stageLabel(locale, stage.id, stage.summary, "summary")}
                  reduce={Boolean(reduce)}
                  locale={locale}
                />
              );
            })}
          </div>
        </Shell>
      </section>

      <section className="py-8 sm:py-10">
        <Shell>
          <div className="surface-dark overflow-hidden rounded-2xl shadow-elevated">
            <div className="grid gap-8 p-6 sm:gap-10 sm:p-8 lg:grid-cols-12 lg:items-end lg:p-10">
              <div className="lg:col-span-5">
                <p className="font-display text-[11px] tracking-[0.22em] text-emerald">{t("mission")}</p>
                <h2 className="mt-4 text-2xl font-bold leading-snug text-white sm:text-3xl md:text-4xl">{t("missionHeading")}</h2>
              </div>
              <div className="space-y-4 text-sm leading-7 text-soft sm:text-base sm:leading-8 lg:col-span-6 lg:col-start-7">
                <p>{t("missionP1")}</p>
                <p>{t("missionP2")}</p>
              </div>
            </div>
          </div>
        </Shell>
      </section>

      <section className="py-10 sm:py-12">
        <Shell>
          <div className="glass rounded-2xl p-5 sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-teal">{t("fromLibrary")}</p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{t("latestNotes")}</h2>
              </div>
              <Link to="/library" className="hairline-link shrink-0 text-sm font-semibold">
                {t("allNotes")}
              </Link>
            </div>
            <ul className="mt-6 divide-y divide-line sm:mt-8">
              {notes.map((note) => (
                <li key={note.id}>
                  <Link to="/library" className="grid gap-2 py-4 sm:grid-cols-12 sm:items-center sm:py-5">
                    <span className="font-display text-xs tracking-[0.14em] text-teal sm:col-span-2">{note.subjectCode}</span>
                    <span className="text-lg font-bold sm:col-span-5 sm:text-xl">
                      {locale === "en"
                        ? `${note.kind === "ملخص" ? t("noteKindSummary") : t("noteKindWorksheet")} ${subjectLabel(locale, note.subjectCode, note.subjectTitle)}`
                        : note.title}
                    </span>
                    <span className="text-sm text-muted sm:col-span-4">
                      {gradeLabel(locale, note.gradeId, note.gradeTitle)} · {stageLabel(locale, note.stageId, note.stageTitle)}
                    </span>
                    <span className="text-sm font-semibold text-teal sm:col-span-1 sm:text-end">
                      {note.kind === "ملخص" ? t("noteKindSummary") : t("noteKindWorksheet")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Shell>
      </section>

      <section className="pb-8">
        <Shell>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm text-teal">{t("fromPlaylists")}</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{t("featuredPlaylists")}</h2>
            </div>
            <Link to="/playlists" className="hairline-link shrink-0 text-sm font-semibold">
              {t("allPlaylists")}
            </Link>
          </div>
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {lessons.map((lesson) => (
              <article key={lesson.id} className="glass overflow-hidden rounded-2xl">
                <div className="aspect-video bg-navy">
                  <iframe
                    title={lesson.title}
                    src={`https://www.youtube-nocookie.com/embed/videoseries?list=${lesson.playlistId}`}
                    className="size-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
                <div className="p-4 sm:p-5">
                  <p className="text-xs text-teal">
                    {gradeLabel(locale, lesson.gradeId, lesson.gradeTitle)} · {subjectLabel(locale, lesson.subjectCode, lesson.subjectTitle)}
                  </p>
                  <h3 className="mt-2 text-lg font-bold sm:text-xl">
                    {locale === "en" ? `Lesson · ${subjectLabel(locale, lesson.subjectCode, lesson.subjectTitle)}` : lesson.title}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        </Shell>
      </section>
    </div>
  );
}

function HomeStageSelect({
  open,
  onToggle,
  stageId,
  index,
  title,
  summary,
  reduce,
  locale,
}: {
  open: boolean;
  onToggle: () => void;
  stageId: StageId;
  index: string;
  title: string;
  summary: string;
  reduce: boolean;
  locale: "ar" | "en";
}) {
  const grades = useGradesByStage(open ? stageId : "");

  return (
    <div className={`glass overflow-hidden rounded-2xl transition ${open ? "glow-ring" : ""}`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-start sm:px-5 sm:py-5"
      >
        <span className="min-w-0">
          <span className="font-display text-xs tracking-[0.16em] text-teal">{index}</span>
          <span className="mt-1 block text-lg font-bold sm:text-xl">{title}</span>
          <span className="mt-1 block text-sm text-muted">{summary}</span>
        </span>
        <span
          className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line sm:size-11 ${
            open ? "brand-gradient text-white" : "bg-emerald/10 text-teal"
          }`}
        >
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 22 }}
          >
            <ChevronDown className="size-5" />
          </motion.span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 28 }}
            className="glass-panel overflow-hidden border-t border-line"
          >
            <ul className="grid gap-1 p-2 sm:grid-cols-2 lg:grid-cols-3">
              {grades.map((grade) => (
                <li key={grade.id}>
                  <Link
                    to={`/grades/${grade.id}`}
                    className="block rounded-xl px-3 py-3 text-fg transition hover:bg-emerald/10 active:bg-emerald/15"
                  >
                    <span className="text-sm font-bold text-fg">{gradeLabel(locale, grade.id, grade.title)}</span>
                    <span className="mt-1 block text-xs text-muted">
                      {gradeLabel(locale, grade.id, grade.subtitle, "subtitle")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function RouteDrawing({ reduce }: { reduce: boolean }) {
  return (
    <svg
      viewBox="0 0 420 640"
      className="pointer-events-none absolute -bottom-10 -start-6 hidden h-[78%] w-[58%] opacity-90 lg:block"
      aria-hidden="true"
    >
      <motion.path
        d="M28 600 C 78 470, 220 510, 176 352 S 86 196, 236 142 S 352 78, 392 34"
        fill="none"
        stroke="#10B981"
        strokeWidth="1.4"
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.85 }}
        transition={{ duration: reduce ? 0 : 1.35, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : 0.12 }}
      />
      <circle cx="176" cy="352" r="2.4" fill="#F3F0E8" opacity="0.75" />
      <circle cx="236" cy="142" r="2.4" fill="#F3F0E8" opacity="0.75" />
      <circle cx="392" cy="34" r="4" fill="#10B981" />
    </svg>
  );
}
