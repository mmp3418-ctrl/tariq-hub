import { ExternalLink } from "lucide-react";
import { useMemo } from "react";
import { ComingSoonBadge } from "../ui/ComingSoonBadge.tsx";
import { ExternalAnchor } from "../ui/ExternalAnchor.tsx";
import { isRowComingSoon } from "../../lib/supabase.ts";
import { usePreferences } from "../../lib/preferences.tsx";
import { useGrades } from "../../services/hooks/useCurriculum.ts";
import { useTeacherPortal } from "../../services/teacherPortal.tsx";

export function GradeCalculatorToolsBoard() {
  const { t, locale } = usePreferences();
  const { ready, calculatorTools, calculatorLocked } = useTeacherPortal();
  const grades = useGrades();

  const grouped = useMemo(() => {
    const byGrade = new Map<string, typeof calculatorTools>();
    for (const tool of calculatorTools) {
      const key = tool.grade_id || "general";
      const list = byGrade.get(key) ?? [];
      list.push(tool);
      byGrade.set(key, list);
    }
    return [...byGrade.entries()].map(([gradeId, tools]) => {
      const grade = grades.find((item) => item.dbId === gradeId || item.id === gradeId);
      return {
        gradeId,
        title: grade?.title || t("teacherResourcesGeneral"),
        tools,
      };
    });
  }, [calculatorTools, grades, t]);

  if (!ready) {
    return <div className="mt-4 h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />;
  }

  if (calculatorTools.length === 0) {
    return null;
  }

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-line p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-bold text-teal">{t("teacherCalcToolsTitle")}</h3>
        {calculatorLocked ? <ComingSoonBadge /> : null}
      </div>
      <p className="mt-1 text-sm text-muted">{t("teacherCalcToolsLead")}</p>

      {calculatorLocked ? (
        <p className="mt-4 text-sm leading-7 text-muted">{t("teacherCalcLockedLead")}</p>
      ) : (
        <div className="mt-4 space-y-4">
          {grouped.map((group) => (
            <div key={group.gradeId} className="min-w-0">
              <p className="text-xs font-bold tracking-wide text-slate-500">{group.title}</p>
              <ul className="mt-2 space-y-2">
                {group.tools.map((tool) => {
                  const soon = isRowComingSoon(tool);
                  const title =
                    locale === "en"
                      ? (tool.title_en || tool.title_ar || "").trim()
                      : (tool.title_ar || tool.title_en || "").trim();
                  const description =
                    locale === "en"
                      ? (tool.description_en || tool.description_ar || "").trim()
                      : (tool.description_ar || tool.description_en || "").trim();
                  return (
                    <li
                      key={tool.id}
                      className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-lg border border-line px-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-fg">{title}</p>
                        {description ? <p className="mt-1 line-clamp-2 text-xs text-muted">{description}</p> : null}
                        {soon ? <ComingSoonBadge className="mt-2" /> : null}
                      </div>
                      {soon || !tool.url ? (
                        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-400">
                          <ExternalLink className="size-3.5" />
                          {t("openResource")}
                        </span>
                      ) : (
                        <ExternalAnchor
                          href={tool.url}
                          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-teal"
                        >
                          <ExternalLink className="size-3.5" />
                          {t("openResource")}
                        </ExternalAnchor>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
