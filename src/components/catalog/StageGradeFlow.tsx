import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { gradeLabel, stageLabel } from "../../i18n/content.ts";
import { usePreferences } from "../../lib/preferences.tsx";
import {
  useGradesByStage,
  useStages,
  useUnitsByGrade,
} from "../../services/hooks/useCurriculum.ts";
import type { StageId } from "../../services/types.ts";
import { ComingSoonBadge } from "../ui/ComingSoonBadge.tsx";

export type FlowStep = "stages" | "grades" | "units" | "content";

type StageGradeFlowProps = {
  step: FlowStep;
  stageId: StageId | null;
  gradeId: string | null;
  unitId?: string | null;
  onSelectStage: (id: StageId) => void;
  onSelectGrade: (id: string) => void;
  onSelectUnit?: (id: string) => void;
  onBackToStages: () => void;
  onBackToGrades: () => void;
  onBackToUnits?: () => void;
  /** When false, skip the units step and go grade → content. */
  enableUnits?: boolean;
  content: ReactNode;
  emptyLabel: string;
};

export function StageGradeFlow({
  step,
  stageId,
  gradeId,
  unitId = null,
  onSelectStage,
  onSelectGrade,
  onSelectUnit,
  onBackToStages,
  onBackToGrades,
  onBackToUnits,
  enableUnits = true,
  content,
  emptyLabel,
}: StageGradeFlowProps) {
  const stages = useStages();
  const grades = useGradesByStage(stageId ?? "");
  const units = useUnitsByGrade(gradeId ?? "");
  const { t, locale, dir } = usePreferences();
  const reduce = useReducedMotion();
  const BackIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const ForwardIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  const selectedStage = stages.find((stage) => stage.id === stageId);
  const selectedGrade = grades.find((grade) => grade.id === gradeId);
  const selectedUnit = units.find((unit) => unit.id === unitId);
  const showUnitsStep = enableUnits && Boolean(gradeId) && units.length > 0;

  const crumbs = [
    { id: "stages" as const, label: t("stepStages"), active: step === "stages" },
    { id: "grades" as const, label: t("stepGrades"), active: step === "grades" },
    ...(showUnitsStep || step === "units"
      ? [{ id: "units" as const, label: t("stepUnits"), active: step === "units" }]
      : []),
    { id: "content" as const, label: t("stepContent"), active: step === "content" },
  ];

  return (
    <div className="mt-8">
      <ol className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold">
        {crumbs.map((item, index) => (
          <li key={item.id} className="flex items-center gap-2">
            {index > 0 ? <span className="text-slate-300 dark:text-slate-600">/</span> : null}
            <span
              className={`rounded-full px-2.5 py-1 ${
                item.active
                  ? "bg-emerald-500/15 text-teal"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait" initial={false}>
        {step === "stages" ? (
          <motion.div
            key="stages"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <p className="mb-4 text-sm text-muted">{t("chooseStageFirst")}</p>
            <ul className="grid gap-3 sm:grid-cols-3">
              {stages.map((stage) => (
                <li key={stage.id}>
                  <button
                    type="button"
                    onClick={() => onSelectStage(stage.id)}
                    className="glass theme-ease flex h-full w-full flex-col rounded-2xl p-5 text-start transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-24px_rgba(16,185,129,0.55)]"
                  >
                    <span className="font-display text-xs tracking-[0.16em] text-teal">{stage.index}</span>
                    <span className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
                      {stageLabel(locale, stage.id, stage.title)}
                    </span>
                    <span className="mt-2 text-sm leading-7 text-muted">
                      {stageLabel(locale, stage.id, stage.summary, "summary")}
                    </span>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal">
                      {t("showGrades")}
                      <ForwardIcon className="size-4" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}

        {step === "grades" && stageId ? (
          <motion.div
            key="grades"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-teal">
                  {selectedStage ? stageLabel(locale, selectedStage.id, selectedStage.title) : ""}
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{t("chooseGradeNext")}</h2>
              </div>
              <button
                type="button"
                onClick={onBackToStages}
                className="inline-flex items-center gap-1 text-sm font-semibold text-teal"
              >
                <BackIcon className="size-4" />
                {t("backToStages")}
              </button>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {grades.map((grade) => (
                <li key={grade.id}>
                  <button
                    type="button"
                    onClick={() => onSelectGrade(grade.id)}
                    className="glass flex w-full items-center justify-between gap-3 rounded-xl px-4 py-4 text-start transition hover:bg-emerald-500/10"
                  >
                    <span>
                      <span className="font-display text-[11px] tracking-[0.14em] text-teal">{grade.index}</span>
                      <span className="mt-1 block text-base font-bold text-slate-900 dark:text-white">
                        {gradeLabel(locale, grade.id, grade.title)}
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        {gradeLabel(locale, grade.id, grade.subtitle, "subtitle")}
                      </span>
                      {grade.isComingSoon ? <ComingSoonBadge className="mt-2" /> : null}
                    </span>
                    <ForwardIcon className="size-4 shrink-0 text-teal" />
                  </button>
                </li>
              ))}
            </ul>
            {grades.length === 0 ? <p className="mt-6 text-sm text-muted">{emptyLabel}</p> : null}
          </motion.div>
        ) : null}

        {step === "units" && stageId && gradeId ? (
          <motion.div
            key="units"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-teal">
                  {selectedStage ? stageLabel(locale, selectedStage.id, selectedStage.title) : ""}
                  {selectedGrade ? ` · ${gradeLabel(locale, selectedGrade.id, selectedGrade.title)}` : ""}
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{t("chooseUnitNext")}</h2>
              </div>
              <button
                type="button"
                onClick={onBackToGrades}
                className="inline-flex items-center gap-1 text-sm font-semibold text-teal"
              >
                <BackIcon className="size-4" />
                {t("backToGrades")}
              </button>
            </div>

            {units.length === 0 ? (
              <p className="text-sm leading-7 text-muted">{t("noUnits")}</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {units.map((unit, index) => (
                  <li key={unit.id}>
                    <button
                      type="button"
                      onClick={() => onSelectUnit?.(unit.id)}
                      className="glass flex w-full items-center justify-between gap-3 rounded-xl px-4 py-4 text-start transition hover:bg-emerald-500/10"
                    >
                      <span className="min-w-0">
                        <span className="font-display text-[11px] tracking-[0.14em] text-teal">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="mt-1 block truncate text-base font-bold text-slate-900 dark:text-white">
                          {unit.title}
                        </span>
                        {unit.isComingSoon ? <ComingSoonBadge className="mt-2" /> : null}
                      </span>
                      <ForwardIcon className="size-4 shrink-0 text-teal" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ) : null}

        {step === "content" && stageId && gradeId ? (
          <motion.div
            key="content"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-teal">
                  {selectedStage ? stageLabel(locale, selectedStage.id, selectedStage.title) : ""}
                  {selectedGrade ? ` · ${gradeLabel(locale, selectedGrade.id, selectedGrade.title)}` : ""}
                  {selectedUnit ? ` · ${selectedUnit.title}` : ""}
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {selectedUnit ? t("resourcesForUnit") : t("resourcesForGrade")}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (showUnitsStep && onBackToUnits) onBackToUnits();
                  else onBackToGrades();
                }}
                className="inline-flex items-center gap-1 text-sm font-semibold text-teal"
              >
                <BackIcon className="size-4" />
                {showUnitsStep ? t("backToUnits") : t("backToGrades")}
              </button>
            </div>
            {content}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
