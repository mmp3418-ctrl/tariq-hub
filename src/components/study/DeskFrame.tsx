import type { ReactNode } from "react";

export function DeskFrame({ kicker, caption, children }: { kicker: string; caption: string; children: ReactNode }) {
  return (
    <figure className="overflow-hidden rounded-md border border-white/10 bg-navy shadow-[0_30px_70px_-42px_rgba(11,19,43,0.65)]">
      <figcaption className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#0F172A] px-4 py-2.5 text-xs text-white/75">
        <span className="font-display tracking-[0.18em] text-emerald">{kicker}</span>
        <span className="text-white">{caption}</span>
      </figcaption>
      {children}
    </figure>
  );
}
