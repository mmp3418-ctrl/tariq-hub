import { BookOpen, Calculator, CalendarDays, Clapperboard } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PublishedSchedulesBoard } from "../components/schedules/PublishedSchedulesBoard.tsx";
import { GradeCalculator } from "../components/teacher/GradeCalculator.tsx";
import { GradeCalculatorToolsBoard } from "../components/teacher/GradeCalculatorToolsBoard.tsx";
import { TeacherResourcesBoard } from "../components/teacher/TeacherResourcesBoard.tsx";
import { TeacherSchedulePlanner } from "../components/teacher/TeacherSchedulePlanner.tsx";
import { ComingSoonBadge } from "../components/ui/ComingSoonBadge.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import {
  useTeacherPortal,
  type TeacherPortalSection,
} from "../services/teacherPortal.tsx";

const SECTIONS: TeacherPortalSection[] = ["resources", "schedules", "calculator"];

function parseSection(value: string | null): TeacherPortalSection {
  if (value === "schedules" || value === "calculator" || value === "resources") return value;
  return "resources";
}

export function TeacherSpacePage() {
  const { t } = usePreferences();
  const { calculatorLocked, schedulesVisible } = useTeacherPortal();
  const [params, setParams] = useSearchParams();
  const section = parseSection(params.get("section"));
  usePageTitle(t("teacherSpace"));

  useEffect(() => {
    if (!params.get("section")) {
      setParams({ section: "resources" }, { replace: true });
    }
  }, [params, setParams]);

  const tabs = useMemo(
    () =>
      [
        { id: "resources" as const, label: t("teacherResourcesTitle") },
        { id: "schedules" as const, label: t("schedulesPageTitle"), locked: !schedulesVisible },
        { id: "calculator" as const, label: t("teacherCalcTitle"), locked: calculatorLocked },
      ] as const,
    [calculatorLocked, schedulesVisible, t],
  );

  const catalogLinks = [
    {
      to: "/teacher-space/playlists",
      title: t("teacherAllPlaylists"),
      icon: Clapperboard,
    },
    {
      to: "/teacher-space/library",
      title: t("teacherAllLibrary"),
      icon: BookOpen,
    },
  ] as const;

  return (
    <Shell className="overflow-x-hidden pb-20">
      <Folio index="05" label={t("folioTeacher")} />

      <header className="surface-dark overflow-hidden rounded-2xl px-5 py-8 shadow-elevated sm:px-8 sm:py-10">
        <p className="font-display text-[11px] tracking-[0.22em] text-emerald">{t("teacherPortalBadge")}</p>
        <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">{t("teacherHeading")}</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-soft sm:text-base">{t("teacherSpaceLead")}</p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {catalogLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex min-w-0 items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-4 text-white transition hover:bg-white/15"
            >
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg brand-gradient">
                <link.icon className="size-4" />
              </span>
              <span className="min-w-0 truncate text-sm font-bold">{link.title}</span>
            </Link>
          ))}
        </div>
      </header>

      <div
        role="tablist"
        aria-label={t("teacherSpace")}
        className="mt-8 flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1"
      >
        {tabs.map((tab) => {
          const active = section === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setParams({ section: tab.id })}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition ${
                active
                  ? "border-emerald/40 bg-emerald-500/15 text-teal"
                  : "border-line text-slate-600 hover:border-emerald/30 dark:text-slate-300"
              }`}
            >
              {tab.id === "schedules" ? <CalendarDays className="size-3.5" /> : null}
              {tab.id === "calculator" ? <Calculator className="size-3.5" /> : null}
              <span>{tab.label}</span>
              {"locked" in tab && tab.locked ? <ComingSoonBadge /> : null}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {section === "resources" ? <TeacherResourcesBoard /> : null}

        {section === "schedules" ? (
          <div className="space-y-8">
            <section className="glass overflow-hidden rounded-2xl p-4 sm:p-6">
              <p className="text-sm text-teal">{t("activeSchedulesKicker")}</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
                {t("activeSchedulesTitle")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{t("activeSchedulesLead")}</p>
              <PublishedSchedulesBoard />
            </section>
            <TeacherSchedulePlanner />
          </div>
        ) : null}

        {section === "calculator" ? (
          <div className="glass overflow-hidden rounded-2xl p-4 sm:p-6">
            <GradeCalculatorToolsBoard />
            {calculatorLocked ? (
              <div className="rounded-xl border border-dashed border-amber-400/40 bg-amber-400/5 px-4 py-6">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{t("teacherCalcTitle")}</p>
                  <ComingSoonBadge />
                </div>
                <p className="mt-2 text-sm leading-7 text-muted">{t("teacherCalcLockedLead")}</p>
              </div>
            ) : (
              <GradeCalculator />
            )}
          </div>
        ) : null}
      </div>

      {!SECTIONS.includes(section) ? <TeacherResourcesBoard /> : null}
    </Shell>
  );
}
