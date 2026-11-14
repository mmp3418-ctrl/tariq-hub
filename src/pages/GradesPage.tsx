import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { gradeLabel, stageLabel } from "../i18n/content.ts";
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
      <header className="glass max-w-3xl rounded-2xl p-6 pt-8 sm:p-8 sm:pt-10">
        <p className="text-sm text-teal">{t("gradesStructure")}</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-6xl">{t("gradesHeading")}</h1>
        <p className="mt-5 text-base leading-8 text-muted">{t("gradesLead")}</p>
      </header>

      <div className="mt-10 space-y-3">
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
    <div className={`glass overflow-hidden rounded-2xl transition ${open ? "glow-ring" : ""}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`stage-${stage.id}`}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-start sm:px-6 sm:py-6"
      >
        <span className="min-w-0">
          <span className="font-display text-xs tracking-[0.18em] text-teal">{stage.index}</span>
          <span className="mt-2 block text-2xl font-bold sm:text-3xl">
            {stageLabel(locale, stage.id, stage.title)}
          </span>
          <span className="mt-2 block text-sm leading-7 text-muted">
            {stageLabel(locale, stage.id, stage.summary, "summary")}
          </span>
        </span>
        <span className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line ${open ? "brand-gradient text-white" : "bg-emerald/10 text-teal"}`}>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: reduce ? 0 : 0.24 }}>
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
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel overflow-hidden border-t border-line"
          >
            <ul className="divide-y divide-line px-2 py-2 sm:px-3">
              {grades.map((grade) => (
                <li key={grade.id}>
                  <Link
                    to={`/grades/${grade.id}`}
                    className="group flex items-center justify-between gap-4 rounded-xl px-3 py-4 text-fg transition hover:bg-emerald/10 sm:px-4"
                  >
                    <span>
                      <span className="font-display text-[11px] tracking-[0.16em] text-teal">{grade.index}</span>
                      <span className="mt-1 block text-lg font-bold">{gradeLabel(locale, grade.id, grade.title)}</span>
                      <span className="mt-1 block text-sm text-muted">
                        {gradeLabel(locale, grade.id, grade.subtitle, "subtitle")}
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-teal opacity-80 transition group-hover:opacity-100">
                      {t("gradeWorkspace")}
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
