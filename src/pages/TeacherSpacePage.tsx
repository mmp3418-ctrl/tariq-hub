import { BookOpen, CalendarRange, Clapperboard, ClipboardList, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";

export function TeacherSpacePage() {
  const { t } = usePreferences();
  usePageTitle(t("teacherSpace"));

  const cards = [
    { icon: CalendarRange, title: t("teacherPacing"), body: t("teacherPacingBody") },
    { icon: ClipboardList, title: t("teacherPlanning"), body: t("teacherPlanningBody") },
    { icon: BookOpen, title: t("teacherResources"), body: t("teacherResourcesBody") },
    { icon: Megaphone, title: t("teacherAnnouncements"), body: t("teacherAnnouncementsBody") },
  ];

  const tips = [t("teacherTip1"), t("teacherTip2"), t("teacherTip3")];

  return (
    <Shell className="pb-20">
      <Folio index="05" label={t("folioTeacher")} />
      <header className="surface-dark overflow-hidden rounded-2xl px-5 py-10 shadow-elevated sm:px-8 sm:py-12 lg:px-12">
        <p className="font-display text-[11px] tracking-[0.22em] text-emerald">{t("teacherEyebrow")}</p>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">{t("teacherHeading")}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-soft sm:mt-5 sm:text-base sm:leading-8">{t("teacherLead")}</p>
        <div className="mt-8 flex flex-wrap gap-2.5">
          <Link
            to="/library"
            className="brand-gradient inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          >
            <BookOpen className="size-4" />
            {t("teacherCtaLibrary")}
          </Link>
          <Link
            to="/playlists"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
          >
            <Clapperboard className="size-4" />
            {t("teacherCtaPlaylists")}
          </Link>
        </div>
      </header>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <li key={card.title} className="glass rounded-2xl p-5 sm:p-6">
            <card.icon className="size-5 text-teal" />
            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{card.title}</h2>
            <p className="mt-2 text-sm leading-7 text-muted">{card.body}</p>
          </li>
        ))}
      </ul>

      <section className="glass mt-8 rounded-2xl p-5 sm:p-8">
        <p className="text-sm text-teal">{t("teacherEyebrow")}</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{t("teacherPlanning")}</h2>
        <ol className="mt-6 space-y-3">
          {tips.map((tip, index) => (
            <li
              key={tip}
              className="flex gap-3 rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm leading-7 text-slate-700 dark:text-slate-200"
            >
              <span className="font-display text-xs font-semibold text-teal">{String(index + 1).padStart(2, "0")}</span>
              <span>{tip}</span>
            </li>
          ))}
        </ol>
      </section>
    </Shell>
  );
}
