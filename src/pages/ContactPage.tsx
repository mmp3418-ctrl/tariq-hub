import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { Folio } from "../components/ui/Folio.tsx";
import { ContactSkeleton } from "../components/ui/CatalogSkeleton.tsx";
import { ExternalAnchor } from "../components/ui/ExternalAnchor.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { SocialIcon } from "../components/brand/SocialIcon.tsx";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import {
  toMailtoHref,
  toTelHref,
  toWhatsAppHref,
  useSiteSettings,
} from "../services/siteSettings.tsx";

export function ContactPage() {
  const settings = useSiteSettings();
  const { t, locale } = usePreferences();
  usePageTitle(t("contact"));

  const phoneNumber = settings?.phoneNumber ?? "";
  const whatsappNumber = settings?.whatsappNumber ?? "";
  const email = settings?.email ?? "";
  const address = settings?.address ?? "";
  const mapsUrl = settings?.mapsUrl ?? "";
  const telegramLink = settings?.telegramLink ?? "";
  const socialLinks = Array.isArray(settings?.socialLinks) ? settings.socialLinks : [];
  const ready = settings?.ready !== false;

  const phoneHref = toTelHref(phoneNumber);
  const whatsappHref = toWhatsAppHref(whatsappNumber);
  const emailHref = toMailtoHref(email);

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
    maps: locale === "en" ? "Maps" : "الخريطة",
    phone: locale === "en" ? "Phone" : "هاتف",
    globe: locale === "en" ? "Website" : "موقع",
  };

  const channelItems = [
    ...socialLinks.filter((item) => item?.isVisible && item?.href),
    ...(telegramLink && !socialLinks.some((item) => item?.platform === "telegram")
      ? [
          {
            id: "telegram-primary",
            platform: "telegram",
            label: "Telegram",
            handle: telegramLink.replace(/^https?:\/\//, ""),
            href: telegramLink,
            icon: "telegram",
            customIconUrl: "",
            isVisible: true,
          },
        ]
      : []),
  ];

  const hasDirectContact =
    Boolean(emailHref) ||
    Boolean(phoneHref) ||
    Boolean(whatsappHref) ||
    Boolean(address) ||
    Boolean(mapsUrl);

  return (
    <div className="overflow-x-hidden pb-20">
      <Shell>
        <Folio index="06" label={t("folioContact")} />
        {!ready ? (
          <ContactSkeleton />
        ) : (
          <section className="mt-6 grid gap-4 lg:grid-cols-12">
            <div className="surface-dark overflow-hidden rounded-2xl px-5 py-10 shadow-elevated sm:px-10 sm:py-14 lg:col-span-5 lg:px-12">
              <p className="font-display text-[11px] tracking-[0.2em] text-emerald">{t("brandMarkEn")}</p>
              <h1 className="mt-4 text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
                {t("contact")}
              </h1>
              <p className="mt-5 max-w-sm text-sm leading-7 text-soft sm:text-base sm:leading-8">{t("contactLead")}</p>

              {!hasDirectContact ? (
                <p className="mt-10 text-sm leading-7 text-soft">{t("awaitingPublish")}</p>
              ) : (
                <dl className="mt-10 space-y-6 text-sm">
                  {emailHref ? (
                    <div>
                      <dt className="text-soft">{t("email")}</dt>
                      <dd className="mt-1">
                        <a
                          href={emailHref}
                          className="inline-flex items-center gap-2 text-base font-semibold text-white"
                        >
                          <Mail className="size-4 text-emerald" />
                          <bdi dir="ltr">{email}</bdi>
                        </a>
                      </dd>
                    </div>
                  ) : null}

                  {phoneHref ? (
                    <div>
                      <dt className="text-soft">{t("phone")}</dt>
                      <dd className="mt-1">
                        <a
                          href={phoneHref}
                          className="inline-flex items-center gap-2 text-base font-semibold text-white"
                          dir="ltr"
                        >
                          <Phone className="size-4 text-emerald" />
                          {phoneNumber}
                        </a>
                      </dd>
                    </div>
                  ) : null}

                  {whatsappHref ? (
                    <div>
                      <dt className="text-soft">WhatsApp</dt>
                      <dd className="mt-1">
                        <ExternalAnchor
                          href={whatsappHref}
                          kind="whatsapp"
                          className="inline-flex items-center gap-2 text-base font-semibold text-white"
                          dir="ltr"
                        >
                          <SocialIcon platform="whatsapp" className="size-4 text-emerald" />
                          {whatsappNumber}
                        </ExternalAnchor>
                      </dd>
                    </div>
                  ) : null}

                  {address || mapsUrl ? (
                    <div>
                      <dt className="text-soft">{t("place")}</dt>
                      <dd className="mt-1">
                        {mapsUrl ? (
                          <ExternalAnchor
                            href={mapsUrl}
                            kind="maps"
                            className="inline-flex items-start gap-2 text-base font-semibold text-white"
                          >
                            <MapPin className="mt-1 size-4 shrink-0 text-emerald" />
                            <span>
                              {address || t("openMap")}
                              <span className="mt-1 inline-flex items-center gap-1 text-sm font-normal text-soft">
                                <ExternalLink className="size-3.5" />
                                {t("openMap")}
                              </span>
                            </span>
                          </ExternalAnchor>
                        ) : (
                          <span className="inline-flex items-start gap-2 text-base font-semibold text-white">
                            <MapPin className="mt-1 size-4 shrink-0 text-emerald" />
                            <span>{address}</span>
                          </span>
                        )}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              )}
            </div>

            <div className="glass rounded-2xl px-5 py-10 sm:px-10 sm:py-14 lg:col-span-7 lg:px-12">
              <p className="text-sm text-teal">{t("contactChannels")}</p>
              <h2 className="mt-3 text-2xl font-bold text-fg sm:text-3xl">{t("contactAccounts")}</h2>
              {channelItems.length === 0 ? (
                <p className="mt-8 text-sm leading-7 text-muted">{t("awaitingPublish")}</p>
              ) : (
                <ul className="mt-8 divide-y divide-line border-y border-line">
                  {channelItems.map((social) => (
                    <li
                      key={social?.id || social?.href}
                      className="flex min-h-14 items-center justify-between gap-4 py-4 sm:py-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-teal">
                          <SocialIcon
                            platform={social?.platform}
                            icon={social?.icon}
                            customIconUrl={social?.customIconUrl}
                            className="size-4"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-fg">
                            {socialLabels[social?.platform ?? ""] ?? social?.label ?? ""}
                          </p>
                          {social?.handle ? (
                            <p className="mt-1 truncate text-sm text-muted">
                              <bdi dir="ltr">{social.handle}</bdi>
                            </p>
                          ) : null}
                        </div>
                      </div>
                      {social?.href ? (
                        <ExternalAnchor
                          href={social.href}
                          kind={social.icon || social.platform}
                          className="shrink-0 text-sm font-semibold text-teal"
                        >
                          {t("open")}
                        </ExternalAnchor>
                      ) : null}
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
