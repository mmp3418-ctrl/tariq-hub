import { useEffect } from "react";
import { usePreferences } from "./preferences.tsx";

export function usePageTitle(title: string) {
  const { locale, t } = usePreferences();

  useEffect(() => {
    const brand = locale === "ar" ? "طارق Hub" : "Tariq Hub";
    document.title = title === t("brandName") || title === "طارق" || title === "Tariq" ? `${brand} — Tariq Hub` : `${title} — ${brand}`;
  }, [title, locale, t]);
}
