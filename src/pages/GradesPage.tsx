import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { gradeLabel, stageLabel } from "../i18n/content.ts";
import { ComingSoonBadge } from "../components/ui/ComingSoonBadge.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import { useGradesByStage, useStages } from "../services/hooks/useCurriculum.ts";
import type { Stage, StageId } from "../services/types.ts";

const stageIds = new Set<StageId>(["primary", "preparatory", "secondary"]);

export function GradesPage() {
  const stages = useStages();
  const { t, locale } = usePreferences();
  const reduce = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const requested = params.get("stage");
  const active = requested && stageIds.has(requested as StageId) ? (requested as StageId) : null;
  usePageTitle(t("grades"));

  const toggle = (id: StageId) => {
    setParams(active === id ? {} : { stage: id }, { replace: true });
  };

  return (
    <Shell className="pb-20">
      <Folio index="02" label={t("folioGrades")} />
      <header className="glass max-w-3xl rounded-2xl p-5 pt-7 sm:p-8 sm:pt-10">
        <p className="text-sm text-teal">{t("gradesStructure")}</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl lg:text-6xl">{t("gradesHeading")}</h1>
        <p className="mt-4 text-sm leading-7 text-muted sm:mt-5 sm:text-base sm:leading-8">{t("gradesLead")}</p>
      </header>

      <div className="mt-8 space-y-3 sm:mt-10">
        {stages.map((stage) => (
          <StageAccordion
            key={stage.id}
            stage={stage}
            open={active === stage.id}
            onToggle={() => toggle(stage.id)}
            reduce={Boolean(reduce)}
            locale={locale}
            t={t}
          />
        ))}
      </div>
    </Shell>
  );
}

function StageAccordion({
  stage,
  open,
  onToggle,
  reduce,
  locale,
  t,
}: {
  stage: Stage;
  open: boolean;
  onToggle: () => void;
  reduce: boolean;
  locale: "ar" | "en";
  t: (key: string) => string;
}) {
  const grades = useGradesByStage(open ? stage.id : "");

  return (
    <div
      className={`glass overflow-hidden rounded-2xl transition duration-300 ${
        open ? "glow-ring ring-1 ring-emerald/20" : "hover:border-emerald/25"
      }`}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`stage-${stage.id}`}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-4 py-5 text-start sm:px-6 sm:py-6"
      >
        <span className="min-w-0">
          <span className="font-display text-xs tracking-[0.18em] text-teal">{stage.index}</span>
          <span className="mt-2 block text-xl font-bold sm:text-2xl md:text-3xl">
            {stageLabel(locale, stage.id, stage.title)}
          </span>
          <span className="mt-2 block text-sm leading-7 text-muted">
            {stageLabel(locale, stage.id, stage.summary, "summary")}
          </span>
        </span>
        <span
          className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line transition sm:size-12 ${
            open ? "brand-gradient border-transparent text-white shadow-[0_10px_24px_-12px_rgba(16,185,129,0.9)]" : "bg-emerald/10 text-teal"
          }`}
        >
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 22 }}
          >
            <ChevronDown className="size-5" />
          </motion.span>
          <span className="sr-only">{open ? t("collapseStage") : t("expandStage")}</span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={`stage-${stage.id}`}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
            className="glass-panel overflow-hidden border-t border-line"
          >
            <ul className="divide-y divide-line px-2 py-2 sm:px-3">
              {grades.map((grade, index) => (
                <motion.li
                  key={grade.id}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduce ? 0 : 0.03 * index, duration: 0.25 }}
                >
                  <Link
                    to={`/grades/${grade.id}`}
                    className="group flex min-h-14 items-center justify-between gap-4 rounded-xl px-3 py-4 text-fg transition hover:bg-emerald/10 active:bg-emerald/15 sm:px-4"
                  >
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-[11px] tracking-[0.16em] text-teal">{grade.index}</span>
                        {grade.isComingSoon ? <ComingSoonBadge /> : null}
                      </span>
                      <span className="mt-1 block text-base font-bold sm:text-lg">
                        {gradeLabel(locale, grade.id, grade.title)}
                      </span>
                      <span className="mt-1 block text-sm text-muted">
                        {gradeLabel(locale, grade.id, grade.subtitle, "subtitle")}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-teal opacity-80 transition group-hover:translate-x-0 group-hover:opacity-100 rtl:group-hover:-translate-x-0">
                      {t("gradeWorkspace")}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
