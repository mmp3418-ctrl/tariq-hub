import { useMemo } from "react";
import { usePreferences } from "../../lib/preferences.tsx";

type TermFilterProps = {
  terms: string[];
  value: string | null;
  onChange: (term: string | null) => void;
};

export function TermFilter({ terms, value, onChange }: TermFilterProps) {
  const { t } = usePreferences();
  const unique = useMemo(
    () => [...new Set(terms.map((term) => term.trim()).filter(Boolean))],
    [terms],
  );

  if (unique.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={t("filterByTerm")}>
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
          value === null
            ? "bg-emerald-500/15 text-teal"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        }`}
      >
        {t("allTerms")}
      </button>
      {unique.map((term) => (
        <button
          key={term}
          type="button"
          onClick={() => onChange(term)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            value === term
              ? "bg-emerald-500/15 text-teal"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          }`}
        >
          {term}
        </button>
      ))}
    </div>
  );
}
