import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { usePreferences } from "../../lib/preferences.tsx";

export function TeacherPortalBanner() {
  const { t } = usePreferences();

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald/30 bg-emerald-500/10 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex size-9 items-center justify-center rounded-full brand-gradient text-white">
          <GraduationCap className="size-4" />
        </span>
        <div>
          <p className="text-xs font-semibold tracking-wide text-teal">{t("teacherPortalBadge")}</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{t("teacherPortalTitle")}</p>
        </div>
      </div>
      <Link to="/teacher-space" className="text-sm font-semibold text-teal hover:underline">
        {t("teacherBackToSpace")}
      </Link>
    </div>
  );
}
