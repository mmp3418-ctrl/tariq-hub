import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Languages, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { usePreferences } from "../../lib/preferences.tsx";
import { useSearch } from "../../lib/search.tsx";
import { useSiteSettings } from "../../services/siteSettings.tsx";
import { Mark } from "../brand/Mark.tsx";

const routes = [
  { to: "/", key: "home", end: true },
  { to: "/grades", key: "grades", end: false },
  { to: "/library", key: "library", end: false },
  { to: "/playlists", key: "playlists", end: false },
  { to: "/teacher-space", key: "teacherSpace", end: false },
  { to: "/contact", key: "contact", end: false },
] as const;

export function SiteNav({ sticky = true }: { sticky?: boolean }) {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const { t, theme, toggleTheme, locale, toggleLocale, dir } = usePreferences();
  const { openSearch } = useSearch();
  const { logoUrl } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const CtaArrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const isDark = theme === "dark";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const iconBtn = isDark
    ? "inline-flex size-9 items-center justify-center rounded-lg text-slate-200 transition hover:bg-white/10 hover:text-white"
    : "inline-flex size-9 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-900/5 hover:text-slate-900";

  const linkBase = isDark
    ? "rounded-md px-2.5 py-1.5 text-[13px] font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
    : "rounded-md px-2.5 py-1.5 text-[13px] font-medium text-slate-700 transition hover:bg-slate-900/5 hover:text-slate-900";

  return (
    <header className={`${sticky ? "fixed inset-x-0 top-0 z-50" : "relative z-50"} px-3 pt-2 sm:px-4 sm:pt-2.5`}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-[90] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-ink"
      >
        {t("skip")}
      </a>

      <div className="glass-nav relative z-50 mx-auto max-w-6xl">
        <div className="flex h-12 items-center justify-between gap-2 px-2.5 sm:h-[3.25rem] sm:gap-3 sm:px-3">
          <Link to="/" className="flex min-w-0 items-center gap-2 rounded-md" aria-label={t("brandAria")}>
            <span className="origin-center scale-90 sm:scale-100">
              <Mark logoUrl={logoUrl} />
            </span>
            <span className="flex min-w-0 flex-col leading-none">
              <span className="font-display text-[9px] font-semibold tracking-[0.18em] text-emerald">{t("brandMarkEn")}</span>
              <span className={`mt-0.5 truncate text-sm font-bold sm:text-[15px] ${isDark ? "text-white" : "text-slate-900"}`}>
                {t("brandName")}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label={t("home")}>
            {routes.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? (isDark ? "!bg-emerald-500/15 !text-emerald-400" : "!bg-emerald-500/10 !text-teal") : ""}`
                }
              >
                {t(link.key)}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <button type="button" onClick={openSearch} className={iconBtn} aria-label={t("search")} title={`${t("search")} (Ctrl+K)`}>
              <Search className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={toggleLocale}
              className={iconBtn}
              aria-label={locale === "ar" ? t("langToEn") : t("langToAr")}
              title={locale === "ar" ? t("langToEn") : t("langToAr")}
            >
              <Languages className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className={iconBtn}
              aria-label={theme === "dark" ? t("themeLight") : t("themeDark")}
              title={theme === "dark" ? t("themeLight") : t("themeDark")}
            >
              {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            </button>
            <Link
              to="/grades"
              className="brand-gradient ms-0.5 hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white shadow-[0_8px_20px_-12px_rgba(16,185,129,0.9)] transition hover:brightness-110 sm:inline-flex"
            >
              {t("startStudy")}
              <CtaArrow className="size-3.5" />
            </Link>
            <button
              type="button"
              className={`${iconBtn} lg:hidden`}
              aria-expanded={open}
              aria-controls="mobile-nav-drawer"
              onClick={() => setOpen((value) => !value)}
            >
              <span className="sr-only">{open ? t("closeMenu") : t("openMenu")}</span>
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label={t("closeMenu")}
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label={t("openMenu")}
              className={`fixed inset-x-3 top-[3.75rem] z-50 max-h-[min(78svh,640px)] overflow-y-auto rounded-xl border p-2.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:inset-x-4 lg:hidden ${
                isDark ? "border-slate-700/80 bg-slate-900/95" : "border-slate-200/80 bg-white/95"
              }`}
              initial={reduce ? false : { opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 34, mass: 0.65 }}
            >
              <nav className="flex flex-col gap-0.5" aria-label={t("openMenu")}>
                {routes.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold transition ${
                        isActive
                          ? "bg-emerald-500/15 text-teal"
                          : isDark
                            ? "text-white hover:bg-white/10"
                            : "text-slate-900 hover:bg-slate-100"
                      }`
                    }
                  >
                    {t(link.key)}
                  </NavLink>
                ))}
              </nav>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openSearch();
                }}
                className={`mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition ${
                  isDark
                    ? "border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                    : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Search className="size-3.5 text-emerald" />
                {t("search")}
                <span className={`ms-auto font-display text-[10px] tracking-wide ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  Ctrl+K
                </span>
              </button>

              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={toggleLocale}
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold ${
                    isDark ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-slate-50 text-slate-900"
                  }`}
                >
                  <Languages className="size-3.5 text-emerald" />
                  {locale === "ar" ? "English" : "العربية"}
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold ${
                    isDark ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-slate-50 text-slate-900"
                  }`}
                >
                  {theme === "dark" ? <Sun className="size-3.5 text-emerald" /> : <Moon className="size-3.5 text-emerald" />}
                  {theme === "dark" ? t("themeLight") : t("themeDark")}
                </button>
              </div>

              <Link
                to="/grades"
                onClick={() => setOpen(false)}
                className="brand-gradient mt-2 inline-flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-sm font-semibold text-white"
              >
                {t("startStudy")}
                <CtaArrow className="size-3.5" />
              </Link>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
