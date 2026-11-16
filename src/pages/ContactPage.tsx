import { Mail, MapPin } from "lucide-react";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import { useContact } from "../services/hooks/useCurriculum.ts";

export function ContactPage() {
  const contact = useContact();
  const { t, locale } = usePreferences();
  usePageTitle(t("contact"));

  const city = locale === "en" ? "Tripoli" : contact.city;
  const country = locale === "en" ? "Libya" : contact.country;
  const address =
    locale === "en" ? "Detailed address will be published with contact details." : contact.address;
  const hours = locale === "en" ? "Replies during study days" : contact.hours;
  const socialLabels: Record<string, string> = {
    youtube: locale === "en" ? "YouTube" : "يوتيوب",
    telegram: locale === "en" ? "Telegram" : "تيليغرام",
    instagram: locale === "en" ? "Instagram" : "إنستغرام",
  };

  return (
    <div className="pb-20">
      <Shell>
        <Folio index="06" label={t("folioContact")} />
      <section className="mt-6 grid gap-4 lg:grid-cols-12">
        <div className="surface-dark overflow-hidden rounded-2xl px-5 py-10 shadow-elevated sm:px-10 sm:py-14 lg:col-span-5 lg:px-12">
          <p className="font-display text-[11px] tracking-[0.2em] text-emerald">{t("brandMarkEn")}</p>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">{t("contact")}</h1>
          <p className="mt-5 max-w-sm text-sm leading-7 text-soft sm:text-base sm:leading-8">{t("contactLead")}</p>
          <dl className="mt-10 space-y-6 text-sm">
            <div>
              <dt className="text-soft">{t("email")}</dt>
              <dd className="mt-1">
                <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 text-base font-semibold text-white">
                  <Mail className="size-4 text-emerald" />
                  <bdi dir="ltr">{contact.email}</bdi>
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-soft">{t("place")}</dt>
              <dd className="mt-1 inline-flex items-start gap-2 text-base font-semibold text-white">
                <MapPin className="mt-1 size-4 shrink-0 text-emerald" />
                <span>
                  {city}{locale === "en" ? ", " : "، "}{country}
                  <span className="mt-1 block text-sm font-normal text-soft">{address}</span>
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-soft">{t("reply")}</dt>
              <dd className="mt-1 text-base text-white">{hours}</dd>
            </div>
          </dl>
        </div>

        <div className="glass rounded-2xl px-5 py-10 sm:px-10 sm:py-14 lg:col-span-7 lg:px-12">
          <p className="text-sm text-teal">{t("contactChannels")}</p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{t("contactAccounts")}</h2>
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {contact.socials.map((social) => (
              <li key={social.id} className="flex min-h-14 items-center justify-between gap-4 py-4 sm:py-5">
                <div className="min-w-0">
                  <p className="font-semibold">{socialLabels[social.id] ?? social.label}</p>
                  <p className="mt-1 text-sm text-muted">
                    <bdi dir="ltr">{social.handle}</bdi>
                  </p>
                </div>
                {social.href ? (
                  <a href={social.href} className="shrink-0 text-sm font-semibold text-teal" target="_blank" rel="noreferrer">
                    {t("open")}
                  </a>
                ) : (
                  <span className="shrink-0 rounded-full border border-emerald/40 px-3 py-1 text-xs font-semibold text-teal">
                    {t("awaitingPublish")}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-md text-sm leading-7 text-muted">{t("contactNote")}</p>
        </div>
      </section>
      </Shell>
    </div>
  );
}
