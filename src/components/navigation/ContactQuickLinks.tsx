import { Phone } from "lucide-react";
import type { ReactNode } from "react";
import {
  externalLinkProps,
  toTelHref,
  toWhatsAppHref,
  useSiteSettings,
} from "../../services/siteSettings.tsx";
import { SocialIcon } from "../brand/SocialIcon.tsx";

type ContactQuickLinksProps = {
  compact?: boolean;
  className?: string;
};

export function ContactQuickLinks({ compact = false, className = "" }: ContactQuickLinksProps) {
  const { phoneNumber, whatsappNumber, telegramLink, socialLinks, email } = useSiteSettings();
  const phoneHref = toTelHref(phoneNumber);
  const whatsappHref = toWhatsAppHref(whatsappNumber);

  const items: { key: string; href: string; label: string; node: ReactNode }[] = [];

  if (phoneHref) {
    items.push({
      key: "phone",
      href: phoneHref,
      label: phoneNumber,
      node: <Phone className="size-3.5 text-teal" />,
    });
  }
  if (whatsappHref) {
    items.push({
      key: "whatsapp",
      href: whatsappHref,
      label: "WhatsApp",
      node: <SocialIcon platform="whatsapp" icon="whatsapp" className="size-3.5 text-teal" />,
    });
  }
  if (telegramLink) {
    items.push({
      key: "telegram",
      href: telegramLink,
      label: "Telegram",
      node: <SocialIcon platform="telegram" icon="telegram" className="size-3.5 text-teal" />,
    });
  }

  for (const social of socialLinks) {
    if (!social.href || !social.isVisible) continue;
    if (social.platform === "telegram" && telegramLink) continue;
    if (social.platform === "whatsapp" && whatsappHref) continue;
    if ((social.platform === "email" || social.icon === "email") && email) continue;
    items.push({
      key: social.id,
      href: social.href,
      label: social.label,
      node: (
        <SocialIcon
          platform={social.platform}
          icon={social.icon}
          customIconUrl={social.customIconUrl}
          className="size-3.5 text-teal"
        />
      ),
    });
  }

  if (items.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {items.map((item) => (
        <a
          key={item.key}
          href={item.href}
          {...externalLinkProps(item.href)}
          aria-label={item.label}
          title={item.label}
          className={`inline-flex items-center justify-center rounded-lg border border-line text-slate-700 transition hover:border-emerald/40 hover:text-teal dark:text-slate-200 ${
            compact ? "size-8" : "min-h-9 gap-1.5 px-2.5 text-xs font-semibold"
          }`}
        >
          {item.node}
          {!compact ? <span className="max-w-[7rem] truncate">{item.label}</span> : null}
        </a>
      ))}
    </div>
  );
}
