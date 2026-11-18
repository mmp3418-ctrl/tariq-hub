import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { usePreferences } from "../../lib/preferences.tsx";
import { useAcademicCatalog } from "../../services/AcademicCatalogProvider.tsx";

export type AcademicFlowStep = "stages" | "grades" | "units" | "content";

type AcademicBrowseFlowProps = {
  step: AcademicFlowStep;
  stageId: string | null;
  gradeId: string | null;
  unitId?: string | null;
  onSelectStage: (id: string) => void;
  onSelectGrade: (id: string) => void;
  onSelectUnit?: (id: string) => void;
  onBackToStages: () => void;
  onBackToGrades: () => void;
  onBackToUnits?: () => void;
  content: ReactNode;
  emptyLabel: string;
};

export function AcademicBrowseFlow({
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
  content,
  emptyLabel,
}: AcademicBrowseFlowProps) {
  const { t, dir } = usePreferences();
  const { stages, gradesByStage, unitsByGrade } = useAcademicCatalog();
  const grades = gradesByStage(stageId ?? "");
  const units = unitsByGrade(gradeId ?? "");
  const reduce = useReducedMotion();
  const BackIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const ForwardIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  const selectedStage = stages.find((s) => s.id === stageId);
  const selectedGrade = grades.find((g) => g.id === gradeId);
  const selectedUnit = units.find((u) => u.id === unitId);
  const showUnits = Boolean(gradeId) && units.length > 0;

  const crumbs = [
    { id: "stages", label: t("stepStages"), active: step === "stages" },
    { id: "grades", label: t("stepGrades"), active: step === "grades" },
    ...(showUnits || step === "units"
      ? [{ id: "units", label: t("stepUnits"), active: step === "units" }]
      : []),
    { id: "content", label: t("stepContent"), active: step === "content" },
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
            {stages.length === 0 ? (
              <p className="text-sm text-muted">{emptyLabel}</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-3">
                {stages.map((stage, index) => (
                  <li key={stage.id}>
                    <button
                      type="button"
                      onClick={() => onSelectStage(stage.id)}
                      className="glass theme-ease flex h-full w-full flex-col rounded-2xl p-5 text-start transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-24px_rgba(16,185,129,0.55)]"
                    >
                      <span className="font-display text-xs tracking-[0.16em] text-teal">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
                        {stage.name}
                      </span>
                      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal">
                        {t("showGrades")}
                        <ForwardIcon className="size-4" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
                <p className="text-sm text-teal">{selectedStage?.name}</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {t("chooseGradeNext")}
                </h2>
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
            {grades.length === 0 ? (
              <p className="text-sm text-muted">{emptyLabel}</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {grades.map((grade, index) => (
                  <li key={grade.id}>
                    <button
                      type="button"
                      onClick={() => onSelectGrade(grade.id)}
                      className="glass flex w-full items-center justify-between gap-3 rounded-xl px-4 py-4 text-start transition hover:bg-emerald-500/10"
                    >
                      <span>
                        <span className="font-display text-[11px] tracking-[0.14em] text-teal">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="mt-1 block text-base font-bold text-slate-900 dark:text-white">
                          {grade.name}
                        </span>
                      </span>
                      <ForwardIcon className="size-4 shrink-0 text-teal" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
                  {selectedStage?.name}
                  {selectedGrade ? ` · ${selectedGrade.name}` : ""}
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {t("chooseUnitNext")}
                </h2>
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
              <p className="text-sm text-muted">{t("noUnits")}</p>
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
                          {unit.name}
                        </span>
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
                  {selectedStage?.name}
                  {selectedGrade ? ` · ${selectedGrade.name}` : ""}
                  {selectedUnit ? ` · ${selectedUnit.name}` : ""}
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {selectedUnit ? t("resourcesForUnit") : t("resourcesForGrade")}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (showUnits && onBackToUnits) onBackToUnits();
                  else onBackToGrades();
                }}
                className="inline-flex items-center gap-1 text-sm font-semibold text-teal"
              >
                <BackIcon className="size-4" />
                {showUnits ? t("backToUnits") : t("backToGrades")}
              </button>
            </div>
            {content}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
