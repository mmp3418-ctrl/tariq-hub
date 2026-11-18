import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { usePreferences } from "../../lib/preferences.tsx";

export function MissingPath({ title, body }: { title: string; body: string }) {
  const { t, dir } = usePreferences();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="mx-auto flex min-h-[68vh] w-full max-w-6xl flex-col justify-center overflow-x-hidden px-5 py-24 sm:px-8">
      <p className="font-display text-xs tracking-[0.22em] text-teal">404</p>
      <h1 className="mt-4 max-w-xl text-4xl font-bold leading-tight text-fg sm:text-5xl">{title}</h1>
      <p className="mt-5 max-w-md text-base leading-8 text-muted">{body}</p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          to="/"
          className="brand-gradient inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-[0_12px_28px_-14px_rgba(16,185,129,1)]"
        >
          <Home className="size-4" />
          {t("backHome")}
          <Arrow className="size-3.5" />
        </Link>
        <Link
          to="/grades"
          className="inline-flex min-h-11 items-center rounded-xl border border-line px-4 text-sm font-semibold text-fg transition hover:border-emerald/40"
        >
          {t("grades")}
        </Link>
      </div>
    </div>
  );
}

export function MissingPathShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[68vh] w-full max-w-6xl flex-col justify-center px-5 py-24 sm:px-8">
      {children}
    </div>
  );
}
