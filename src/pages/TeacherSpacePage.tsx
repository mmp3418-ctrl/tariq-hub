import { Shell } from "../components/ui/Shell.tsx";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";

/** Blank template — Teacher's Area content removed pending future rebuild. */
export function TeacherSpacePage() {
  const { t } = usePreferences();
  usePageTitle(t("teacherSpace"));

  return <Shell className="pb-20" />;
}
