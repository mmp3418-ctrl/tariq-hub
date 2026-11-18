import { CalendarDays } from "lucide-react";
import { Navigate } from "react-router-dom";
import { UniversalTimetable } from "../components/schedules/UniversalTimetable.tsx";
import { CatalogSkeleton } from "../components/ui/CatalogSkeleton.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { useSiteTimetableActive } from "../hooks/useSiteTimetableActive.ts";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";

export function SchedulesPage() {
  const { t } = usePreferences();
  const { ready, active } = useSiteTimetableActive();
  usePageTitle(t("schedulesPageTitle"));

  if (!ready) {
    return (
      <Shell className="pb-20">
        <CatalogSkeleton rows={2} />
      </Shell>
    );
  }

  if (!active) {
    return <Navigate to="/" replace />;
  }

  return (
    <Shell className="overflow-x-hidden pb-20">
      <Folio index="06" label={t("folioSchedules")} />
      <header className="surface-dark overflow-hidden rounded-2xl px-5 py-8 shadow-elevated sm:px-8 sm:py-10">
        <div className="flex flex-wrap items-start gap-4">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/30">
            <CalendarDays className="size-6 text-emerald-400" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-display text-[11px] tracking-[0.22em] text-emerald">
              {t("universalTimetableBadge")}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
              {t("schedulesPageTitle")}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-soft sm:text-base">
              {t("universalTimetableLead")}
            </p>
          </div>
        </div>
      </header>

      <div className="mt-8">
        <UniversalTimetable />
      </div>
    </Shell>
  );
}
