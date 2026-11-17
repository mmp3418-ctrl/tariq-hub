import { Link } from "react-router-dom";
import { GradeCalculator } from "../components/teacher/GradeCalculator.tsx";
import { TeacherPortalBanner } from "../components/teacher/TeacherPortalBanner.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";

export function GradeCalculatorPage() {
  const { t } = usePreferences();
  usePageTitle(t("teacherCalcTitle"));

  return (
    <Shell className="overflow-x-hidden pb-20">
      <Folio index="06" label={t("folioCalculator")} />
      <TeacherPortalBanner />

      <header className="surface-dark overflow-hidden rounded-2xl px-5 py-8 shadow-elevated sm:px-8 sm:py-10">
        <p className="font-display text-[11px] tracking-[0.22em] text-emerald">{t("teacherPortalBadge")}</p>
        <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">{t("teacherCalcTitle")}</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-soft sm:text-base">{t("teacherCalcLead")}</p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link
            to="/teacher-space"
            className="inline-flex min-h-11 items-center rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15"
          >
            {t("teacherResourcesTitle")}
          </Link>
          <Link
            to="/schedules"
            className="inline-flex min-h-11 items-center rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15"
          >
            {t("schedulesPageTitle")}
          </Link>
        </div>
      </header>

      <div className="mt-8">
        <GradeCalculator />
      </div>
    </Shell>
  );
}
