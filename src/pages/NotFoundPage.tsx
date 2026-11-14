import { MissingPath } from "../components/ui/MissingPath.tsx";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";

export function NotFoundPage() {
  const { locale } = usePreferences();
  usePageTitle(locale === "en" ? "Not found" : "الصفحة غير موجودة");

  return (
    <MissingPath
      title={locale === "en" ? "This page left the path." : "هذه الصفحة خرجت عن المسار."}
      body={
        locale === "en"
          ? "The link does not match a page in Tariq Hub. Return home or open the stage guide."
          : "الرابط لا يطابق صفحة في طارق Hub. ارجع إلى الرئيسية أو افتح دليل المراحل."
      }
    />
  );
}
