import { Link } from "react-router-dom";
import { usePreferences } from "../../lib/preferences.tsx";
import { useSiteSettings } from "../../services/siteSettings.tsx";
import { Mark } from "../brand/Mark.tsx";
import { Shell } from "../ui/Shell.tsx";
import { ContactQuickLinks } from "./ContactQuickLinks.tsx";

const links = [
  { to: "/grades", key: "grades" },
  { to: "/library", key: "library" },
  { to: "/playlists", key: "playlists" },
  { to: "/teacher-space", key: "teacherSpace" },
  { to: "/contact", key: "contact" },
] as const;

/** Footer always leads with Stages (المراحل الدراسية). */

export function SiteFooter() {
  const { t } = usePreferences();
  const { logoUrl = "" } = useSiteSettings() ?? {};

  return (
    <footer className="mt-auto overflow-x-hidden border-t border-line">
      <Shell className="flex flex-col gap-8 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <Mark logoUrl={logoUrl} className="size-8" />
            <div className="min-w-0">
              <p className="font-display text-[11px] font-semibold tracking-[0.2em] text-teal">
                {t("brandMarkEn")}
              </p>
              <p className="mt-1 truncate text-sm font-bold text-slate-900 dark:text-white">
                {t("brandName")}
              </p>
            </div>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-7 text-muted">{t("footerTag")}</p>
          <ContactQuickLinks className="mt-5" />
        </div>

        <div className="flex max-w-full flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="hairline-link text-fg">
              {t(link.key)}
            </Link>
          ))}
          <p className="text-muted">© 2026 {t("brandName")}</p>
        </div>
      </Shell>
    </footer>
  );
}
