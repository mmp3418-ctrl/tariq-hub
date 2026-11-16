import { BookOpen, Clapperboard, GraduationCap, Home } from "lucide-react";
import { NavLink } from "react-router-dom";
import { usePreferences } from "../../lib/preferences.tsx";

const items = [
  { to: "/", key: "home", icon: Home, end: true },
  { to: "/library", key: "library", icon: BookOpen, end: false },
  { to: "/playlists", key: "playlists", icon: Clapperboard, end: false },
  { to: "/teacher-space", key: "teacherSpace", icon: GraduationCap, end: false },
] as const;

export function MobileBottomNav() {
  const { t } = usePreferences();

  return (
    <nav aria-label={t("mobileNav")} className="fixed inset-x-3 bottom-3 z-40 md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-1 rounded-2xl border border-slate-200/80 bg-white/92 px-2 py-2 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/92">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-semibold transition ${
                isActive
                  ? "bg-emerald-500/15 text-teal"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`
            }
          >
            <item.icon className="size-4" />
            <span className="truncate">{t(item.key)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
