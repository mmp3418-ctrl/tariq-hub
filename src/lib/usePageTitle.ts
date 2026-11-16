import { useEffect } from "react";
import { usePreferences } from "./preferences.tsx";

export function usePageTitle(title: string) {
  const { locale, t } = usePreferences();

  useEffect(() => {
    const brand = locale === "ar" ? "منصة طارق" : "Tariq Hub";
    const isHome =
      title === t("brandName") || title === "منصة طارق" || title === "Tariq Hub" || title === "Tariq Platform";
    document.title = isHome ? brand : `${title} — ${brand}`;
  }, [locale, t, title]);
}
