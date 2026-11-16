import { Mail, MapPin, Phone } from "lucide-react";
import { Folio } from "../components/ui/Folio.tsx";
import { ContactSkeleton } from "../components/ui/CatalogSkeleton.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { SocialIcon } from "../components/brand/SocialIcon.tsx";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import { useContact } from "../services/hooks/useCurriculum.ts";
import { toTelHref, toWhatsAppHref, useSiteSettings } from "../services/siteSettings.tsx";

export function ContactPage() {
  const contact = useContact();
  const settings = useSiteSettings();
  const { t, locale } = usePreferences();
  usePageTitle(t("contact"));

  const city = locale === "en" ? "Tripoli" : contact.city;
  const country = locale === "en" ? "Libya" : contact.country;
  const address =
    locale === "en" ? "Detailed address will be published with contact details." : contact.address;
  const hours = locale === "en" ? "Replies during study days" : contact.hours;
  const phoneHref = toTelHref(settings.phoneNumber);
  const whatsappHref = toWhatsAppHref(settings.whatsappNumber);

  const socialLabels: Record<string, string> = {
    youtube: locale === "en" ? "YouTube" : "يوتيوب",
    telegram: locale === "en" ? "Telegram" : "تيليغرام",
    instagram: locale === "en" ? "Instagram" : "إنستغرام",
    facebook: locale === "en" ? "Facebook" : "فيسبوك",
    x: "X",
    twitter: "X",
    linkedin: "LinkedIn",
    whatsapp: "WhatsApp",
    tiktok: "TikTok",
    snapchat: "Snapchat",
    globe: locale === "en" ? "Website" : "موقع",
  };

  const channelItems = [
    ...settings.socialLinks,
    ...(settings.telegramLink && !settings.socialLinks.some((item) => item.platform === "telegram")
      ? [
          {
            id: "telegram-primary",
            platform: "telegram",
            label: "Telegram",
            handle: settings.telegramLink.replace(/^https?:\/\//, ""),
            href: settings.telegramLink,
            icon: "telegram",
            customIconUrl: "",
          },
        ]
      : []),
  ];

  return (
    <div className="pb-20">
      <Shell>
        <Folio index="06" label={t("folioContact")} />
        {!settings.ready ? (
          <ContactSkeleton />
        ) : (
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
                {settings.phoneNumber ? (
                  <div>
                    <dt className="text-soft">{t("phone")}</dt>
                    <dd className="mt-1">
                      <a
                        href={phoneHref || undefined}
                        className="inline-flex items-center gap-2 text-base font-semibold text-white"
                        dir="ltr"
                      >
                        <Phone className="size-4 text-emerald" />
                        {settings.phoneNumber}
                      </a>
                    </dd>
                  </div>
                ) : null}
                {settings.whatsappNumber ? (
                  <div>
                    <dt className="text-soft">WhatsApp</dt>
                    <dd className="mt-1">
                      <a
                        href={whatsappHref || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-base font-semibold text-white"
                        dir="ltr"
                      >
                        <SocialIcon platform="whatsapp" className="size-4 text-emerald" />
                        {settings.whatsappNumber}
                      </a>
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-soft">{t("place")}</dt>
                  <dd className="mt-1 inline-flex items-start gap-2 text-base font-semibold text-white">
                    <MapPin className="mt-1 size-4 shrink-0 text-emerald" />
                    <span>
                      {city}
                      {locale === "en" ? ", " : "، "}
                      {country}
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
              {channelItems.length === 0 ? (
                <p className="mt-8 text-sm leading-7 text-muted">{t("awaitingPublish")}</p>
              ) : (
                <ul className="mt-8 divide-y divide-line border-y border-line">
                  {channelItems.map((social) => (
                    <li key={social.id} className="flex min-h-14 items-center justify-between gap-4 py-4 sm:py-5">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-teal">
                          <SocialIcon
                            platform={social.platform}
                            icon={social.icon}
                            customIconUrl={social.customIconUrl}
                            className="size-4"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{socialLabels[social.platform] ?? social.label}</p>
                          <p className="mt-1 truncate text-sm text-muted">
                            <bdi dir="ltr">{social.handle}</bdi>
                          </p>
                        </div>
                      </div>
                      <a
                        href={social.href}
                        className="shrink-0 text-sm font-semibold text-teal"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("open")}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-6 max-w-md text-sm leading-7 text-muted">{t("contactNote")}</p>
            </div>
          </section>
        )}
      </Shell>
    </div>
  );
}
