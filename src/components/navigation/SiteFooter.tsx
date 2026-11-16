import { Link } from "react-router-dom";
import { usePreferences } from "../../lib/preferences.tsx";
import { Shell } from "../ui/Shell.tsx";

const links = [
  { to: "/grades", key: "grades" },
  { to: "/library", key: "library" },
  { to: "/playlists", key: "playlists" },
  { to: "/teacher-space", key: "teacherSpace" },
  { to: "/contact", key: "contact" },
] as const;

export function SiteFooter() {
  const { t } = usePreferences();

  return (
    <footer className="mt-auto border-t border-line">
      <Shell className="flex flex-col gap-8 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-[11px] font-semibold tracking-[0.2em] text-teal">{t("brandMarkEn")}</p>
          <p className="mt-3 max-w-sm text-sm leading-7 text-muted">{t("footerTag")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
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
