import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultSiteSettings,
  fetchSiteSettings,
  isSupabaseConfigured,
  supabase,
  type DbSiteSettings,
  type DbSocialLink,
} from "../lib/supabase.ts";

export type SocialLink = {
  id: string;
  platform: string;
  label: string;
  handle: string;
  href: string;
};

export type SiteSettings = {
  logoUrl: string;
  phoneNumber: string;
  whatsappNumber: string;
  telegramLink: string;
  socialLinks: SocialLink[];
  ready: boolean;
  source: "mock" | "supabase";
  refresh: () => Promise<void>;
};

const SiteSettingsContext = createContext<SiteSettings | null>(null);

function digitsOnly(value: string) {
  return value.replace(/[^\d+]/g, "");
}

export function toTelHref(phone: string) {
  const cleaned = digitsOnly(phone);
  return cleaned ? `tel:${cleaned}` : "";
}

export function toWhatsAppHref(phone: string) {
  const cleaned = digitsOnly(phone).replace(/^\+/, "");
  return cleaned ? `https://wa.me/${cleaned}` : "";
}

function platformFromUrl(url: string) {
  const value = url.toLowerCase();
  if (value.includes("facebook")) return "facebook";
  if (value.includes("instagram")) return "instagram";
  if (value.includes("youtube") || value.includes("youtu.be")) return "youtube";
  if (value.includes("t.me") || value.includes("telegram")) return "telegram";
  if (value.includes("x.com") || value.includes("twitter")) return "x";
  if (value.includes("tiktok")) return "tiktok";
  if (value.includes("linkedin")) return "linkedin";
  if (value.includes("whatsapp") || value.includes("wa.me")) return "whatsapp";
  return "link";
}

function normalizeSocial(entry: DbSocialLink | string, index: number): SocialLink | null {
  if (typeof entry === "string") {
    const href = entry.trim();
    if (!href) return null;
    const platform = platformFromUrl(href);
    return {
      id: `${platform}-${index}`,
      platform,
      label: platform,
      handle: href.replace(/^https?:\/\//, ""),
      href,
    };
  }

  const href = (entry.url || entry.href || "").trim();
  if (!href) return null;
  const platform = (entry.platform || entry.id || platformFromUrl(href)).toLowerCase();
  const label = (entry.label || platform).trim() || platform;
  const handle = (entry.handle || href.replace(/^https?:\/\//, "")).trim();
  return {
    id: `${platform}-${index}`,
    platform,
    label,
    handle,
    href,
  };
}

function mapSettings(row: DbSiteSettings | null, source: "mock" | "supabase"): Omit<SiteSettings, "refresh"> {
  const data = row ?? defaultSiteSettings;
  const rawLinks = Array.isArray(data.social_links) ? data.social_links : [];
  const socialLinks = rawLinks
    .map((entry, index) => normalizeSocial(entry as DbSocialLink | string, index))
    .filter((entry): entry is SocialLink => Boolean(entry));

  const telegramLink = (data.telegram_link ?? "").trim();
  if (telegramLink && !socialLinks.some((link) => link.platform === "telegram")) {
    socialLinks.unshift({
      id: "telegram-primary",
      platform: "telegram",
      label: "Telegram",
      handle: telegramLink.replace(/^https?:\/\//, ""),
      href: telegramLink,
    });
  }

  return {
    logoUrl: (data.logo_url ?? "").trim(),
    phoneNumber: (data.phone_number ?? "").trim(),
    whatsappNumber: (data.whatsapp_number ?? "").trim(),
    telegramLink,
    socialLinks,
    ready: true,
    source,
  };
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [row, setRow] = useState<DbSiteSettings | null>(null);
  const [source, setSource] = useState<"mock" | "supabase">("mock");
  const [ready, setReady] = useState(false);

  const hydrate = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setRow(defaultSiteSettings);
      setSource("mock");
      setReady(true);
      return;
    }
    const remote = await fetchSiteSettings();
    if (remote) {
      setRow(remote);
      setSource("supabase");
    } else {
      setRow(defaultSiteSettings);
      setSource("mock");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const channel = client
      .channel("tariq-site-settings")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () => {
        void fetchSiteSettings().then((remote) => {
          if (remote) {
            setRow(remote);
            setSource("supabase");
          }
        });
      })
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, []);

  const value = useMemo<SiteSettings>(() => {
    const mapped = mapSettings(row, source);
    return {
      ...mapped,
      ready,
      refresh: hydrate,
    };
  }, [hydrate, ready, row, source]);

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  return ctx;
}
