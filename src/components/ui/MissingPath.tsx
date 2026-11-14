import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { usePreferences } from "../../lib/preferences.tsx";

export function MissingPath({ title, body }: { title: string; body: string }) {
  const { t } = usePreferences();

  return (
    <Shellless>
      <p className="font-display text-xs tracking-[0.22em] text-teal">404</p>
      <h1 className="mt-4 max-w-xl text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
      <p className="mt-5 max-w-md text-base leading-8 text-muted">{body}</p>
      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
        <Link to="/" className="hairline-link text-teal">
          {t("home")}
        </Link>
        <Link to="/grades" className="hairline-link">
          {t("grades")}
        </Link>
      </div>
    </Shellless>
  );
}

function Shellless({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex min-h-[68vh] w-full max-w-6xl flex-col justify-center px-5 py-24 sm:px-8">{children}</div>;
}
