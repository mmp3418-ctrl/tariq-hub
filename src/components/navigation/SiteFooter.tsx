import { Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { usePreferences } from "../../lib/preferences.tsx";
import { toTelHref, toWhatsAppHref, useSiteSettings } from "../../services/siteSettings.tsx";
import { Mark } from "../brand/Mark.tsx";
import { SocialIcon } from "../brand/SocialIcon.tsx";
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
  const { logoUrl, phoneNumber, whatsappNumber, socialLinks } = useSiteSettings();
  const phoneHref = toTelHref(phoneNumber);
  const whatsappHref = toWhatsAppHref(whatsappNumber);

  return (
    <footer className="mt-auto border-t border-line">
      <Shell className="flex flex-col gap-8 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Mark logoUrl={logoUrl} className="size-8" />
            <p className="font-display text-[11px] font-semibold tracking-[0.2em] text-teal">{t("brandMarkEn")}</p>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-7 text-muted">{t("footerTag")}</p>

          {(phoneHref || whatsappHref || socialLinks.length > 0) && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {phoneHref ? (
                <a
                  href={phoneHref}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold text-slate-700 transition hover:border-emerald/40 hover:text-teal dark:text-slate-200"
                  dir="ltr"
                >
                  <Phone className="size-3.5 text-teal" />
                  {phoneNumber}
                </a>
              ) : null}
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold text-slate-700 transition hover:border-emerald/40 hover:text-teal dark:text-slate-200"
                  dir="ltr"
                >
                  <SocialIcon platform="whatsapp" className="size-3.5 text-teal" />
                  WhatsApp
                </a>
              ) : null}
              {socialLinks.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-line text-slate-700 transition hover:border-emerald/40 hover:text-teal dark:text-slate-200"
                >
                  <SocialIcon platform={social.platform} className="size-3.5" />
                </a>
              ))}
            </div>
          )}
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
