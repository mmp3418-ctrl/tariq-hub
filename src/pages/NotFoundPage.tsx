import { MissingPath } from "../components/ui/MissingPath.tsx";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";

export function NotFoundPage() {
  const { locale } = usePreferences();
  usePageTitle(locale === "en" ? "Not found" : "الصفحة غير موجودة");

  return (
    <MissingPath
      title={locale === "en" ? "Page not found" : "الصفحة غير موجودة"}
      body={
        locale === "en"
          ? "This link does not match a page in Tariq Hub. Use the button below to return home."
          : "هذا الرابط لا يطابق أي صفحة في منصة طارق. استخدم الزر أدناه للعودة إلى الرئيسية."
      }
    />
  );
}
