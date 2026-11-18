import { Download, Eye } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  AcademicBrowseFlow,
  type AcademicFlowStep,
} from "../components/catalog/AcademicBrowseFlow.tsx";
import { CatalogSkeleton } from "../components/ui/CatalogSkeleton.tsx";
import { EmptyIcons, EmptyState } from "../components/ui/EmptyState.tsx";
import { ExternalAnchor } from "../components/ui/ExternalAnchor.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import { useAcademicCatalog } from "../services/AcademicCatalogProvider.tsx";
import type { MaterialView } from "../services/academicCatalog.ts";

const TYPE_ORDER = [
  "classbook",
  "كتاب حصة",
  "book",
  "workbook",
  "كتاب واجب",
  "notebook",
  "كراسة",
  "note",
  "grammar",
  "قواعد",
  "vocabulary",
  "مفردات",
  "worksheet",
  "ورقة عمل",
];

function groupByType(items: MaterialView[]) {
  const map = new Map<string, MaterialView[]>();
  for (const item of items) {
    const key = item.materialType || "classbook";
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return [...map.entries()].sort((a, b) => {
    const ai = TYPE_ORDER.indexOf(a[0]);
    const bi = TYPE_ORDER.indexOf(b[0]);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

export function LibraryPage() {
  const { ready, materialsByGrade, materialsByUnit, unitsByGrade } = useAcademicCatalog();
  const { t, locale } = usePreferences();
  const [step, setStep] = useState<AcademicFlowStep>("stages");
  const [stageId, setStageId] = useState<string | null>(null);
  const [gradeId, setGradeId] = useState<string | null>(null);
  const [unitId, setUnitId] = useState<string | null>(null);
  usePageTitle(t("library"));

  const units = unitsByGrade(gradeId ?? "");

  useEffect(() => {
    if (step !== "units" || !gradeId) return;
    if (units.length === 0) setStep("content");
  }, [gradeId, step, units.length]);

  const activeMaterials = useMemo(() => {
    if (unitId) {
      const byUnit = materialsByUnit(unitId);
      if (byUnit.length > 0) return byUnit;
      // Fallback: unit label mismatch — still show grade materials so items aren't hidden.
      const byGrade = gradeId ? materialsByGrade(gradeId) : [];
      if (byGrade.length > 0) {
        console.warn("[tariq] LibraryPage: unit filter empty, falling back to grade", {
          unitId,
          gradeId,
          gradeCount: byGrade.length,
        });
      }
      return byGrade;
    }
    if (gradeId) return materialsByGrade(gradeId);
    return [];
  }, [gradeId, materialsByGrade, materialsByUnit, unitId]);

  const groups = useMemo(() => groupByType(activeMaterials), [activeMaterials]);

  return (
    <Shell className="overflow-x-hidden pb-20">
      <Folio index="03" label={t("folioLibrary")} />
      <header className="glass max-w-3xl rounded-2xl p-5 pt-7 sm:p-8 sm:pt-10">
        <p className="text-sm text-teal">{t("libraryKind")}</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl lg:text-6xl">
          {t("library")}
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted sm:mt-5 sm:text-base sm:leading-8">
          {t("libraryLead")}
        </p>
      </header>

      {!ready ? (
        <div>
          <p className="sr-only">{t("loadingCatalog")}</p>
          <CatalogSkeleton rows={3} />
        </div>
      ) : (
        <AcademicBrowseFlow
          step={step}
          stageId={stageId}
          gradeId={gradeId}
          unitId={unitId}
          onSelectStage={(id) => {
            setStageId(id);
            setGradeId(null);
            setUnitId(null);
            setStep("grades");
          }}
          onSelectGrade={(id) => {
            setGradeId(id);
            setUnitId(null);
            setStep("units");
          }}
          onSelectUnit={(id) => {
            setUnitId(id);
            setStep("content");
          }}
          onBackToStages={() => {
            setStageId(null);
            setGradeId(null);
            setUnitId(null);
            setStep("stages");
          }}
          onBackToGrades={() => {
            setGradeId(null);
            setUnitId(null);
            setStep("grades");
          }}
          onBackToUnits={() => {
            setUnitId(null);
            setStep(units.length > 0 ? "units" : "grades");
          }}
          emptyLabel={t("emptyMaterialsLead")}
          content={
            groups.length === 0 ? (
              <EmptyState
                icon={EmptyIcons.materials}
                title={t("emptyMaterialsTitle")}
                description={t("emptyMaterialsLead")}
                tone="soft"
              />
            ) : (
              <div className="space-y-8">
                <p className="text-sm text-muted">
                  {unitId ? t("libraryUnitScope") : t("libraryGradeScope")}
                </p>
                {groups.map(([type, items]) => (
                  <section key={type} className="min-w-0">
                    <div className="mb-3 flex items-end justify-between gap-3">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {locale === "en" ? items[0]?.badgeEn : items[0]?.badgeAr}
                      </h3>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-teal">
                        {items.length}
                      </span>
                    </div>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {items.map((item) => (
                        <li key={item.id}>
                          <article className="glass flex h-full flex-col gap-3 rounded-2xl p-4 sm:p-5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-teal">
                                {locale === "en" ? item.badgeEn : item.badgeAr}
                              </span>
                              {item.unitName ? (
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                  {item.unitName}
                                </span>
                              ) : null}
                            </div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">
                              {item.title}
                            </h4>
                            <div className="mt-auto flex flex-wrap gap-3 pt-1 text-sm font-semibold">
                              <ExternalAnchor
                                href={item.pdfUrl}
                                kind="pdf"
                                className="inline-flex items-center gap-1.5 text-teal"
                              >
                                <Eye className="size-4" />
                                {t("quickPreview")}
                              </ExternalAnchor>
                              <ExternalAnchor
                                href={item.pdfUrl}
                                kind="pdf"
                                download={`${item.title || "material"}.pdf`}
                                className="inline-flex items-center gap-1.5 text-slate-900 dark:text-white"
                              >
                                <Download className="size-4" />
                                {t("downloadDirect")}
                              </ExternalAnchor>
                            </div>
                          </article>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )
          }
        />
      )}
    </Shell>
  );
}
