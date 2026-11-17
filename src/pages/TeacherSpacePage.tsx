import { BookOpen, Calculator, CalendarDays, Clapperboard } from "lucide-react";
import { Link } from "react-router-dom";
import { TeacherResourcesBoard } from "../components/teacher/TeacherResourcesBoard.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";

export function TeacherSpacePage() {
  const { t } = usePreferences();
  usePageTitle(t("teacherSpace"));

  const tools = [
    {
      to: "/schedules",
      title: t("schedulesPageTitle"),
      lead: t("schedulesToolLead"),
      icon: CalendarDays,
    },
    {
      to: "/grade-calculator",
      title: t("teacherCalcTitle"),
      lead: t("teacherCalcLead"),
      icon: Calculator,
    },
    {
      to: "/teacher-space/playlists",
      title: t("teacherAllPlaylists"),
      lead: t("teacherCatalogLead"),
      icon: Clapperboard,
    },
    {
      to: "/teacher-space/library",
      title: t("teacherAllLibrary"),
      lead: t("teacherCatalogLead"),
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
          {tools.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="flex min-w-0 items-start gap-3 rounded-xl border border-white/20 bg-white/10 p-4 text-white transition hover:bg-white/15"
            >
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg brand-gradient">
                <tool.icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">{tool.title}</span>
                <span className="mt-1 block text-xs leading-5 text-soft">{tool.lead}</span>
              </span>
            </Link>
          ))}
        </div>
      </header>

      <div className="mt-8">
        <TeacherResourcesBoard />
      </div>
    </Shell>
  );
}
