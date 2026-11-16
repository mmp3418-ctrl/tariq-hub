import { usePreferences } from "../../lib/preferences.tsx";

export function ComingSoonBadge({ className = "" }: { className?: string }) {
  const { t } = usePreferences();
  return (
    <span
      className={`inline-flex items-center rounded-full border border-amber-400/50 bg-amber-400/15 px-2.5 py-1 text-[11px] font-bold tracking-wide text-amber-700 dark:text-amber-300 ${className}`}
    >
      {t("comingSoon")}
    </span>
  );
}
