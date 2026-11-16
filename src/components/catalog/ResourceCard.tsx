import { Download, Play } from "lucide-react";
import type { ReactNode } from "react";
import { resolveCardColor, resolveResourceIcon } from "../../lib/resourceVisuals.ts";
import { ComingSoonBadge } from "../ui/ComingSoonBadge.tsx";

type ResourceCardProps = {
  title: string;
  meta: string;
  description?: string;
  coverImage?: string;
  cardColor?: string;
  iconName?: string;
  term?: string;
  variant: "pdf" | "video";
  actions?: ReactNode;
  onOpen?: () => void;
  isComingSoon?: boolean;
};

export function ResourceCard({
  title,
  meta,
  description = "",
  coverImage = "",
  cardColor = "#0f766e",
  iconName = "file-text",
  term = "",
  variant,
  actions,
  onOpen,
  isComingSoon = false,
}: ResourceCardProps) {
  const color = resolveCardColor(cardColor);
  const Icon = resolveResourceIcon(iconName);

  return (
    <article
      className={`glass group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border transition ${isComingSoon ? "opacity-90" : "hover:-translate-y-0.5"}`}
      style={{ borderColor: `${color}55`, boxShadow: `0 18px 40px -28px ${color}` }}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
        {coverImage ? (
          <img src={coverImage} alt="" className="size-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div
            className="flex size-full items-center justify-center"
            style={{ background: `linear-gradient(145deg, ${color}, #0b132b)` }}
          >
            <Icon className="size-10 text-white/90" />
          </div>
        )}
        <span
          className="absolute start-3 top-3 inline-flex size-9 items-center justify-center rounded-xl text-white shadow-lg"
          style={{ backgroundColor: color }}
        >
          {variant === "video" ? <Play className="ms-0.5 size-4 fill-current" /> : <Icon className="size-4" />}
        </span>
        {isComingSoon ? (
          <span className="absolute end-3 top-3">
            <ComingSoonBadge />
          </span>
        ) : null}
        {term ? (
          <span className="absolute bottom-3 end-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {term}
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4 sm:p-5">
        <p className="truncate text-xs font-semibold" style={{ color }}>
          {meta}
        </p>
        <h3 className="line-clamp-2 text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        {description ? <p className="line-clamp-3 text-sm leading-6 text-muted">{description}</p> : null}
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-3 text-sm font-semibold">
          {onOpen ? (
            <button
              type="button"
              onClick={onOpen}
              disabled={isComingSoon}
              className="text-teal disabled:cursor-not-allowed disabled:opacity-40"
            >
              {variant === "video" ? "تشغيل" : "معاينة"}
            </button>
          ) : null}
          {isComingSoon ? null : actions}
        </div>
      </div>
    </article>
  );
}

export function ResourceDownloadAction({ href, fileName, label }: { href: string; fileName: string; label: string }) {
  return (
    <a href={href} download={fileName} className="inline-flex items-center gap-1.5 text-slate-900 dark:text-white">
      <Download className="size-4" />
      {label}
    </a>
  );
}
