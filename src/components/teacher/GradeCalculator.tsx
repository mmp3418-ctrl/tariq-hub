import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { usePreferences } from "../../lib/preferences.tsx";

type Row = {
  id: string;
  name: string;
  continuous: string;
  midterm: string;
  finalScore: string;
};

function num(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function createRow(): Row {
  return {
    id: crypto.randomUUID(),
    name: "",
    continuous: "",
    midterm: "",
    finalScore: "",
  };
}

const fieldClass =
  "w-full min-w-0 rounded-md border border-line bg-surface px-2 py-2 text-xs text-fg outline-none ring-emerald/30 placeholder:text-muted focus:border-emerald/40 focus:ring-2";

export function GradeCalculator() {
  const { t, dir } = usePreferences();
  const [rows, setRows] = useState<Row[]>([createRow(), createRow()]);

  const totals = useMemo(
    () =>
      rows.map((row) => {
        const continuous = num(row.continuous);
        const midterm = num(row.midterm);
        const finalScore = num(row.finalScore);
        const total = continuous + midterm + finalScore;
        const average = total / 3;
        return { total, average };
      }),
    [rows],
  );

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  return (
    <section className="glass overflow-hidden rounded-2xl p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-teal">{t("teacherCalcTitle")}</p>
          <h2 className="mt-1 text-xl font-bold text-fg sm:text-2xl">{t("teacherCalcTitle")}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{t("teacherCalcLead")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRows((current) => [...current, createRow()])}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-semibold"
          >
            <Plus className="size-3.5 text-teal" />
            {t("teacherCalcAddRow")}
          </button>
          <button
            type="button"
            onClick={() => setRows([createRow()])}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-semibold"
          >
            {t("teacherCalcReset")}
          </button>
        </div>
      </div>

      {/* Mobile card layout — avoids horizontal page scroll */}
      <div className="mt-5 space-y-3 md:hidden">
        {rows.map((row, index) => (
          <div key={row.id} className="rounded-xl border border-line p-3">
            <div className="flex items-center justify-between gap-2">
              <label className="min-w-0 flex-1 text-xs font-semibold text-muted">
                {t("teacherCalcStudent")}
                <input
                  value={row.name}
                  onChange={(event) => updateRow(row.id, { name: event.target.value })}
                  placeholder={`${t("teacherCalcStudent")} ${index + 1}`}
                  className={`${fieldClass} mt-1`}
                  dir={dir}
                />
              </label>
              <button
                type="button"
                onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label={t("teacherCalcReset")}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(
                [
                  ["continuous", "teacherCalcContinuous"],
                  ["midterm", "teacherCalcMidterm"],
                  ["finalScore", "teacherCalcFinal"],
                ] as const
              ).map(([field, labelKey]) => (
                <label key={field} className="min-w-0 text-[11px] font-semibold text-muted">
                  {t(labelKey)}
                  <input
                    inputMode="decimal"
                    value={row[field]}
                    onChange={(event) => updateRow(row.id, { [field]: event.target.value })}
                    className={`${fieldClass} mt-1`}
                    dir="ltr"
                  />
                </label>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-teal" dir="ltr">
                {t("teacherCalcTotal")}: {totals[index].total.toFixed(1)}
              </span>
              <span className="font-semibold text-fg" dir="ltr">
                {t("teacherCalcAverage")}: {totals[index].average.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 -mx-1 hidden overflow-x-auto overscroll-x-contain px-1 md:block">
        <table className="min-w-[720px] w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-line bg-surface px-2 py-2 text-start">{t("teacherCalcStudent")}</th>
              <th className="border border-line bg-surface px-2 py-2 text-start">{t("teacherCalcContinuous")}</th>
              <th className="border border-line bg-surface px-2 py-2 text-start">{t("teacherCalcMidterm")}</th>
              <th className="border border-line bg-surface px-2 py-2 text-start">{t("teacherCalcFinal")}</th>
              <th className="border border-line bg-surface px-2 py-2 text-start">{t("teacherCalcTotal")}</th>
              <th className="border border-line bg-surface px-2 py-2 text-start">{t("teacherCalcAverage")}</th>
              <th className="border border-line bg-surface px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td className="border border-line p-1.5">
                  <input
                    value={row.name}
                    onChange={(event) => updateRow(row.id, { name: event.target.value })}
                    placeholder={`${t("teacherCalcStudent")} ${index + 1}`}
                    className={fieldClass}
                    dir={dir}
                  />
                </td>
                {(["continuous", "midterm", "finalScore"] as const).map((field) => (
                  <td key={field} className="border border-line p-1.5">
                    <input
                      inputMode="decimal"
                      value={row[field]}
                      onChange={(event) => updateRow(row.id, { [field]: event.target.value })}
                      className={fieldClass}
                      dir="ltr"
                    />
                  </td>
                ))}
                <td className="border border-line px-2 py-2 font-semibold text-teal" dir="ltr">
                  {totals[index].total.toFixed(1)}
                </td>
                <td className="border border-line px-2 py-2 font-semibold" dir="ltr">
                  {totals[index].average.toFixed(1)}
                </td>
                <td className="border border-line p-1.5">
                  <button
                    type="button"
                    onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}
                    className="inline-flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label={t("teacherCalcReset")}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
