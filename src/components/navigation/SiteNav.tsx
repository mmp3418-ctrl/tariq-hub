import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Languages, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
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

const item = "rounded-md px-2.5 py-2 text-sm text-white transition-colors hover:text-emerald focus-visible:outline-offset-2";

export function SiteNav() {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const { t, theme, toggleTheme, locale, toggleLocale, dir } = usePreferences();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const CtaArrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:start-3 focus:z-[90] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-navy"
      >
        {t("skip")}
      </a>
      <div className="glass-nav mx-auto max-w-6xl overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
          <Link to="/" className="flex items-center gap-3 rounded-md" aria-label={t("brandAria")}>
            <Mark />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[10px] font-semibold tracking-[0.28em] text-emerald">TARIQ HUB</span>
              <span className="mt-1 text-lg font-bold text-white">{t("brandName")}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label={t("home")}>
            {routes.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `${item} ${isActive ? "!text-emerald" : ""}`}
              >
                {t(link.key)}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={toggleLocale}
              className="inline-flex size-10 items-center justify-center rounded-md text-white/85 transition hover:bg-white/10 hover:text-white"
              aria-label={locale === "ar" ? t("langToEn") : t("langToAr")}
              title={locale === "ar" ? t("langToEn") : t("langToAr")}
            >
              <Languages className="size-4" />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex size-10 items-center justify-center rounded-md text-white/85 transition hover:bg-white/10 hover:text-white"
              aria-label={theme === "dark" ? t("themeLight") : t("themeDark")}
              title={theme === "dark" ? t("themeLight") : t("themeDark")}
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <Link
              to="/grades"
              className="brand-gradient hidden items-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_-14px_rgba(16,185,129,0.95)] transition hover:brightness-110 sm:inline-flex"
            >
              {t("startStudy")}
              <CtaArrow className="size-4" />
            </Link>
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-md text-white lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpenPath(open ? null : pathname)}
            >
              <span className="sr-only">{open ? t("closeMenu") : t("openMenu")}</span>
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              id="mobile-nav"
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduce ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-white/10 lg:hidden"
            >
              <nav className="flex flex-col gap-1 px-3 py-3" aria-label={t("openMenu")}>
                {routes.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) => `${item} ${isActive ? "!text-emerald" : "!text-white"}`}
                  >
                    {t(link.key)}
                  </NavLink>
                ))}
                <Link
                  to="/grades"
                  className="brand-gradient mt-2 inline-flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold text-white sm:hidden"
                >
                  {t("startStudy")}
                  <CtaArrow className="size-4" />
                </Link>
              </nav>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
