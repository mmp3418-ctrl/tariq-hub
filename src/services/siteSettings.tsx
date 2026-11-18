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
  normalizeExternalHref,
  toMailtoHref,
  toTelHref,
  toTelegramHref,
  toWhatsAppHref,
} from "../lib/contactLinks.ts";
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
  icon: string;
  customIconUrl: string;
  isVisible: boolean;
};

export type SiteSettings = {
  logoUrl: string;
  phoneNumber: string;
  whatsappNumber: string;
  telegramLink: string;
  email: string;
  address: string;
  mapsUrl: string;
  socialLinks: SocialLink[];
  heroSubtitleAr: string;
  heroSubtitleEn: string;
  bookYearLabel: string;
  ready: boolean;
  source: "mock" | "supabase";
  refresh: () => Promise<void>;
};

const SiteSettingsContext = createContext<SiteSettings | null>(null);

export { toMailtoHref, toTelHref, toTelegramHref, toWhatsAppHref, normalizeExternalHref };
export { externalLinkProps, isInternalSafeScheme } from "../lib/contactLinks.ts";

function platformFromUrl(url: string) {
  const value = url.toLowerCase();
  if (value.includes("facebook")) return "facebook";
  if (value.includes("instagram")) return "instagram";
  if (value.includes("youtube") || value.includes("youtu.be")) return "youtube";
  if (value.includes("t.me") || value.includes("telegram")) return "telegram";
  if (value.includes("x.com") || value.includes("twitter")) return "x";
  if (value.includes("tiktok")) return "tiktok";
  if (value.includes("linkedin")) return "linkedin";
  if (value.includes("snapchat")) return "snapchat";
  if (value.includes("whatsapp") || value.includes("wa.me")) return "whatsapp";
  if (value.includes("maps.google") || value.includes("goo.gl/maps") || value.includes("maps.app")) {
    return "maps";
  }
  return "globe";
}

function firstNonEmpty(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const trimmed = (value ?? "").trim();
    if (trimmed) return trimmed;
  }
  return "";
}

function normalizeSocial(entry: DbSocialLink | string, index: number): SocialLink | null {
  if (typeof entry === "string") {
    const href = normalizeExternalHref(entry);
    if (!href) return null;
    const platform = platformFromUrl(href);
    return {
      id: `${platform}-${index}`,
      platform,
      label: platform,
      handle: href.replace(/^https?:\/\//, ""),
      href,
      icon: platform,
      customIconUrl: "",
      isVisible: true,
    };
  }

  const visible = entry.is_visible !== false && entry.is_active !== false;
  if (!visible) return null;

  const rawUrl = firstNonEmpty(entry.url, entry.href);
  const platform = (entry.platform || entry.id || platformFromUrl(rawUrl) || "globe").toLowerCase();
  const icon = (entry.icon || platform).toLowerCase();
  const href = normalizeExternalHref(rawUrl, icon || platform);
  if (!href) return null;

  const label = (entry.label || entry.platform || platform).trim() || platform;
  const handle = (entry.handle || rawUrl.replace(/^https?:\/\//, "") || label).trim();

  return {
    id: entry.id || `${platform}-${index}`,
    platform,
    label,
    handle,
    href,
    icon,
    customIconUrl: (entry.custom_icon_url || "").trim(),
    isVisible: true,
  };
}

function mapSettings(row: DbSiteSettings | null, source: "mock" | "supabase"): Omit<SiteSettings, "refresh" | "ready"> {
  const data = row ?? defaultSiteSettings;
  const rawLinks = Array.isArray(data.social_links) ? data.social_links : [];
  const socialLinks = rawLinks
    .map((entry, index) => normalizeSocial(entry as DbSocialLink | string, index))
    .filter((entry): entry is SocialLink => Boolean(entry));

  const phoneNumber = (data.phone_number ?? "").trim();
  const whatsappNumber = (data.whatsapp_number ?? "").trim();
  const telegramRaw = (data.telegram_link ?? "").trim();

  return {
    logoUrl: (data.logo_url ?? "").trim(),
    phoneNumber,
    whatsappNumber,
    telegramLink: telegramRaw ? toTelegramHref(telegramRaw) || telegramRaw : "",
    email: firstNonEmpty(data.email, data.contact_email),
    address: firstNonEmpty(data.address, data.address_text, data.location_text),
    mapsUrl: normalizeExternalHref(
      firstNonEmpty(data.maps_url, data.google_maps_url, data.location_url),
      "maps",
    ),
    socialLinks,
    heroSubtitleAr: (data.hero_subtitle_ar || defaultSiteSettings.hero_subtitle_ar || "").trim(),
    heroSubtitleEn: (data.hero_subtitle_en || defaultSiteSettings.hero_subtitle_en || "").trim(),
    bookYearLabel: (data.book_year_label || defaultSiteSettings.book_year_label || "2026 - 2027").trim(),
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
    const onFocus = () => {
      void hydrate();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void hydrate();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
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
