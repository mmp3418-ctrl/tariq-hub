import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { CatalogSkeleton } from "../components/ui/CatalogSkeleton.tsx";
import { EmptyIcons, EmptyState } from "../components/ui/EmptyState.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import { useAcademicCatalog } from "../services/AcademicCatalogProvider.tsx";
import type { AcademicStageView } from "../services/academicCatalog.ts";

export function GradesPage() {
  const { ready, stages, gradesByStage } = useAcademicCatalog();
  const { t } = usePreferences();
  const reduce = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const active = params.get("stage");
  const safeStages = Array.isArray(stages) ? stages : [];
  usePageTitle(t("grades"));

  const toggle = (id: string) => {
    setParams(active === id ? {} : { stage: id }, { replace: true });
  };

  return (
    <Shell className="pb-20">
      <Folio index="02" label={t("folioGrades")} />
      <header className="glass max-w-3xl rounded-2xl p-5 pt-7 sm:p-8 sm:pt-10">
        <p className="text-sm text-teal">{t("gradesStructure")}</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl lg:text-6xl">
          {t("gradesHeading")}
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted sm:mt-5 sm:text-base sm:leading-8">
          {t("gradesLead")}
        </p>
      </header>

      {!ready ? (
        <div className="mt-8">
          <p className="sr-only">{t("loadingCatalog")}</p>
          <CatalogSkeleton rows={3} />
        </div>
      ) : safeStages.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={EmptyIcons.stages}
            title={t("emptyStagesTitle")}
            description={t("emptyStagesLead")}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-3 sm:mt-10">
          {safeStages.map((stage, index) => (
            <StageAccordion
              key={stage.id || `stage-${index}`}
              stage={stage}
              index={index}
              open={active === stage.id}
              onToggle={() => toggle(stage.id)}
              grades={gradesByStage(stage.id)}
              reduce={Boolean(reduce)}
              t={t}
            />
          ))}
        </div>
      )}
    </Shell>
  );
}

function StageAccordion({
  stage,
  index,
  open,
  onToggle,
  grades,
  reduce,
  t,
}: {
  stage: AcademicStageView;
  index: number;
  open: boolean;
  onToggle: () => void;
  grades: ReturnType<ReturnType<typeof useAcademicCatalog>["gradesByStage"]>;
  reduce: boolean;
  t: (key: string) => string;
}) {
  const safeGrades = Array.isArray(grades) ? grades : [];

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
          <span className="font-display text-xs tracking-[0.18em] text-teal">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="mt-2 block text-xl font-bold sm:text-2xl md:text-3xl">
            {stage.name || t("comingSoon")}
          </span>
          <span className="mt-2 block text-sm leading-7 text-muted">
            {safeGrades.length > 0
              ? `${safeGrades.length} ${t("stepGrades")}`
              : t("emptyGradesLead")}
          </span>
        </span>
        <span
          className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line transition sm:size-12 ${
            open
              ? "brand-gradient border-transparent text-white shadow-[0_10px_24px_-12px_rgba(16,185,129,0.9)]"
              : "bg-emerald/10 text-teal"
          }`}
        >
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={
              reduce ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 22 }
            }
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
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", stiffness: 260, damping: 28, mass: 0.8 }
            }
            className="glass-panel overflow-hidden border-t border-line"
          >
            {safeGrades.length === 0 ? (
              <div className="p-4 sm:p-5">
                <EmptyState
                  icon={EmptyIcons.stages}
                  title={t("emptyGradesTitle")}
                  description={t("emptyGradesLead")}
                  tone="soft"
                  className="py-8 sm:py-10"
                />
              </div>
            ) : (
              <ul className="divide-y divide-line px-2 py-2 sm:px-3">
                {safeGrades.map((grade, gradeIndex) => (
                  <motion.li
                    key={grade.id || `grade-${gradeIndex}`}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: reduce ? 0 : 0.03 * gradeIndex,
                      duration: 0.25,
                    }}
                  >
                    <Link
                      to={`/grades/${grade.id}`}
                      className="group flex min-h-14 items-center justify-between gap-4 rounded-xl px-3 py-4 text-fg transition hover:bg-emerald/10 active:bg-emerald/15 sm:px-4"
                    >
                      <span className="min-w-0">
                        <span className="font-display text-[11px] tracking-[0.16em] text-teal">
                          {String(gradeIndex + 1).padStart(2, "0")}
                        </span>
                        <span className="mt-1 block text-base font-bold sm:text-lg">
                          {grade.name || t("comingSoon")}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-teal opacity-80 transition group-hover:opacity-100">
                        {t("gradeWorkspace")}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
