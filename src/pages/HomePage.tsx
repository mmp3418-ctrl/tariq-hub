import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Clapperboard, GraduationCap, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { HeroBook3D } from "../components/brand/HeroBook3D.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import { useSiteSettings } from "../services/siteSettings.tsx";

export function HomePage() {
  const reduce = useReducedMotion();
  const { t, dir, locale } = usePreferences();
  const { heroSubtitleAr, heroSubtitleEn } = useSiteSettings();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  usePageTitle(t("brandName"));

  const heroLead =
    (locale === "en" ? heroSubtitleEn : heroSubtitleAr).trim() || t("heroLead");

  const gateways = [
    { to: "/grades", key: "ctaGrades", icon: Layers, text: t("grades") },
    { to: "/library", key: "ctaLibrary", icon: BookOpen, text: t("library") },
    { to: "/playlists", key: "ctaPlaylists", icon: Clapperboard, text: t("playlists") },
    { to: "/teacher-space", key: "ctaTeacher", icon: GraduationCap, text: t("teacherSpace") },
  ] as const;

  return (
    <div className="overflow-x-hidden pb-16">
      <Shell>
        <Folio index="01" label={t("folioHome")} />
      </Shell>

      <Shell className="mt-4">
        <section className="surface-dark relative isolate overflow-x-clip overflow-y-visible rounded-2xl shadow-elevated">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(16,185,129,0.26),transparent_42%),radial-gradient(circle_at_92%_8%,rgba(255,255,255,0.08),transparent_34%)]" />
          <div className="relative grid grid-cols-1 items-center gap-8 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-12 lg:gap-6 lg:px-10 lg:py-14">
            <div className="order-2 flex min-w-0 flex-col justify-center gap-8 lg:order-1 lg:col-span-7">
              <p className="font-display text-[11px] font-semibold tracking-[0.22em] text-emerald">
                {locale === "en" ? t("brandMarkEn") : t("brandName")}
              </p>
              <div className="max-w-2xl">
                <h1 className="text-3xl font-extrabold leading-[1.12] text-white md:text-5xl lg:text-6xl">
                  <span className="text-gradient">{t("heroTitle")}</span>
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-7 text-soft sm:mt-5 sm:text-base sm:leading-8 md:text-lg">
                  {heroLead}
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Link
                  to="/grades"
                  className="brand-gradient inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_-16px_rgba(16,185,129,1)]"
                >
                  {t("ctaGrades")}
                  <Arrow className="size-4" />
                </Link>
                <Link
                  to="/library"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
                >
                  {t("ctaLibrary")}
                </Link>
                <Link
                  to="/teacher-space"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
                >
                  {t("ctaTeacher")}
                </Link>
              </div>
            </div>
            <div className="order-1 lg:order-2 lg:col-span-5">
              <HeroBook3D className="py-1 sm:py-2" />
            </div>
          </div>
        </section>
      </Shell>

      <Shell className="mt-10 sm:mt-14">
        <section className="surface-dark overflow-hidden rounded-2xl shadow-elevated">
          <div className="grid gap-8 p-6 sm:gap-10 sm:p-8 lg:grid-cols-12 lg:items-end lg:p-10">
            <div className="lg:col-span-5">
              <p className="font-display text-[11px] tracking-[0.22em] text-emerald">{t("mission")}</p>
              <h2 className="mt-4 text-2xl font-bold leading-snug text-white sm:text-3xl md:text-4xl">{t("missionHeading")}</h2>
            </div>
            <div className="space-y-4 text-sm leading-7 text-soft sm:text-base sm:leading-8 lg:col-span-6 lg:col-start-7">
              <p>{t("missionP1")}</p>
              <p>{t("missionP2")}</p>
            </div>
          </div>
        </section>
      </Shell>

      <Shell className="mt-10 sm:mt-14 pb-4">
        <div className="mb-6 max-w-2xl">
          <p className="text-sm text-teal">{t("gatewaysTitle")}</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">{t("gatewaysLead")}</h2>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {gateways.map((item, index) => (
            <motion.li
              key={item.to}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.05 * index, duration: 0.3 }}
            >
              <Link
                to={item.to}
                className="glass theme-ease flex min-h-[7.5rem] flex-col justify-between rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-24px_rgba(16,185,129,0.55)]"
              >
                <item.icon className="size-5 text-teal" />
                <span className="mt-6 text-lg font-bold text-slate-900 dark:text-white">{item.text}</span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </Shell>
    </div>
  );
}
