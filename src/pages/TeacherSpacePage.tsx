import { Shell } from "../components/ui/Shell.tsx";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";

export function TeacherSpacePage() {
  const { t } = usePreferences();
  usePageTitle(t("teacherSpace"));

  return (
    <Shell className="pb-20">
      <div className="flex min-h-[55vh] items-center justify-center px-4">
        <p
          dir="rtl"
          lang="ar"
          className="font-display text-2xl font-semibold tracking-[0.08em] text-muted sm:text-3xl"
        >
          قيد التطوير
        </p>
      </div>
    </Shell>
  );
}
