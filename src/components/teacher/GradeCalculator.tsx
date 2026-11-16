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

export function GradeCalculator() {
  const { t } = usePreferences();
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

  return (
    <section className="glass overflow-hidden rounded-2xl p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-teal">{t("teacherCalcTitle")}</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">{t("teacherCalcTitle")}</h2>
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

      <div className="mt-5 overflow-x-auto">
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
                    onChange={(event) =>
                      setRows((current) =>
                        current.map((item) => (item.id === row.id ? { ...item, name: event.target.value } : item)),
                      )
                    }
                    placeholder={`${t("teacherCalcStudent")} ${index + 1}`}
                    className="w-full rounded-md border border-transparent bg-white px-2 py-2 text-xs outline-none ring-emerald/30 focus:border-emerald/40 focus:ring-2 dark:bg-slate-950"
                  />
                </td>
                {(["continuous", "midterm", "finalScore"] as const).map((field) => (
                  <td key={field} className="border border-line p-1.5">
                    <input
                      inputMode="decimal"
                      value={row[field]}
                      onChange={(event) =>
                        setRows((current) =>
                          current.map((item) =>
                            item.id === row.id ? { ...item, [field]: event.target.value } : item,
                          ),
                        )
                      }
                      className="w-full rounded-md border border-transparent bg-white px-2 py-2 text-xs outline-none ring-emerald/30 focus:border-emerald/40 focus:ring-2 dark:bg-slate-950"
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
