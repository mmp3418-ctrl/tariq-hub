import { BookOpen, Clapperboard, Layers, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  tone?: "default" | "soft";
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon: Icon = Layers,
  tone = "default",
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`glass flex flex-col items-center justify-center rounded-2xl px-6 py-12 text-center sm:px-10 sm:py-14 ${
        tone === "soft" ? "border border-dashed border-line bg-transparent shadow-none" : ""
      } ${className}`}
      role="status"
    >
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-teal">
        <Icon className="size-7" aria-hidden />
      </span>
      <p className="mt-5 text-lg font-bold text-slate-900 dark:text-white">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-7 text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export const EmptyIcons = {
  stages: Layers,
  materials: BookOpen,
  playlists: Clapperboard,
} as const;
