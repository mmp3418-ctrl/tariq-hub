import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Languages, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { usePreferences } from "../../lib/preferences.tsx";
import { Mark } from "../brand/Mark.tsx";

const routes = [
  { to: "/", key: "home", end: true },
  { to: "/grades", key: "grades", end: false },
  { to: "/library", key: "library", end: false },
  { to: "/playlists", key: "playlists", end: false },
  { to: "/contact", key: "contact", end: false },
] as const;

const navItem =
  "rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-offset-2";

export function SiteNav() {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const { t, theme, toggleTheme, locale, toggleLocale, dir } = usePreferences();
  const [open, setOpen] = useState(false);
  const CtaArrow = dir === "rtl" ? ArrowLeft : ArrowRight;

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

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:start-3 focus:z-[90] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-ink"
      >
        {t("skip")}
      </a>

      <div className="glass-nav relative z-50 mx-auto max-w-6xl rounded-2xl">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2.5 rounded-md sm:gap-3" aria-label={t("brandAria")}>
            <Mark />
            <span className="flex min-w-0 flex-col leading-none">
              <span className="font-display text-[10px] font-semibold tracking-[0.28em] text-emerald">TARIQ HUB</span>
              <span className="mt-1 truncate text-base font-bold text-white sm:text-lg">{t("brandName")}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label={t("home")}>
            {routes.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `${navItem} ${isActive ? "!bg-white/10 !text-emerald" : ""}`}
              >
                {t(link.key)}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={toggleLocale}
              className="inline-flex size-11 items-center justify-center rounded-xl text-white transition hover:bg-white/10"
              aria-label={locale === "ar" ? t("langToEn") : t("langToAr")}
              title={locale === "ar" ? t("langToEn") : t("langToAr")}
            >
              <Languages className="size-4" />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex size-11 items-center justify-center rounded-xl text-white transition hover:bg-white/10"
              aria-label={theme === "dark" ? t("themeLight") : t("themeDark")}
              title={theme === "dark" ? t("themeLight") : t("themeDark")}
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <Link
              to="/grades"
              className="brand-gradient hidden items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_-14px_rgba(16,185,129,0.95)] transition hover:brightness-110 sm:inline-flex"
            >
              {t("startStudy")}
              <CtaArrow className="size-4" />
            </Link>
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-xl text-white transition hover:bg-white/10 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav-drawer"
              onClick={() => setOpen((value) => !value)}
            >
              <span className="sr-only">{open ? t("closeMenu") : t("openMenu")}</span>
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
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
              className="fixed inset-0 z-40 bg-ink/45 backdrop-blur-[2px] lg:hidden"
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
              className="fixed inset-x-3 top-[4.75rem] z-50 max-h-[min(78svh,640px)] overflow-y-auto rounded-2xl border border-white/10 bg-ink p-3 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] sm:inset-x-5 lg:hidden"
              initial={reduce ? false : { opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.7 }}
            >
              <nav className="flex flex-col gap-1" aria-label={t("openMenu")}>
                {routes.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex min-h-12 items-center rounded-xl px-4 text-base font-semibold transition ${
                        isActive ? "bg-emerald/15 text-emerald" : "text-white hover:bg-white/10"
                      }`
                    }
                  >
                    {t(link.key)}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={toggleLocale}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <Languages className="size-4 text-emerald" />
                  {locale === "ar" ? "English" : "العربية"}
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {theme === "dark" ? <Sun className="size-4 text-emerald" /> : <Moon className="size-4 text-emerald" />}
                  {theme === "dark" ? t("themeLight") : t("themeDark")}
                </button>
              </div>

              <Link
                to="/grades"
                onClick={() => setOpen(false)}
                className="brand-gradient mt-3 inline-flex min-h-12 w-full items-center justify-between rounded-xl px-4 text-sm font-semibold text-white"
              >
                {t("startStudy")}
                <CtaArrow className="size-4" />
              </Link>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
