import { Download, Eraser } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { exportUniversalTimetablePdf } from "../../lib/exportUniversalTimetablePdf.ts";
import { usePreferences } from "../../lib/preferences.tsx";

export const UNIVERSAL_DAYS_AR = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
] as const;

export const UNIVERSAL_DAYS_EN = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

export const UNIVERSAL_PERIODS = [1, 2, 3, 4, 5, 6, 7] as const;

const STORAGE_KEY = "tariq-universal-timetable-v1";
const DAY_COUNT = 7;
const PERIOD_COUNT = 7;

/** dayIndex → periodIndex → subject text */
export type TimetableCells = string[][];

function emptyGrid(): TimetableCells {
  return Array.from({ length: DAY_COUNT }, () =>
    Array.from({ length: PERIOD_COUNT }, () => ""),
  );
}

function loadGrid(): TimetableCells {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyGrid();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return emptyGrid();
    return Array.from({ length: DAY_COUNT }, (_, day) => {
      const row = Array.isArray(parsed[day]) ? (parsed[day] as unknown[]) : [];
      return Array.from({ length: PERIOD_COUNT }, (_, period) =>
        String(row[period] ?? ""),
      );
    });
  } catch {
    return emptyGrid();
  }
}

function persistGrid(grid: TimetableCells) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(grid));
  } catch {
    /* ignore quota / private mode */
  }
}

type UniversalTimetableProps = {
  /** Compact mode for embedding inside Teacher Space */
  embedded?: boolean;
};

export function UniversalTimetable({ embedded = false }: UniversalTimetableProps) {
  const { t, locale } = usePreferences();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [cells, setCells] = useState<TimetableCells>(() =>
    typeof window === "undefined" ? emptyGrid() : loadGrid(),
  );
  const days = locale === "en" ? UNIVERSAL_DAYS_EN : UNIVERSAL_DAYS_AR;

  useEffect(() => {
    persistGrid(cells);
  }, [cells]);

  function setCell(dayIndex: number, periodIndex: number, value: string) {
    setCells((prev) => {
      const next = prev.map((row) => [...row]);
      if (!next[dayIndex]) next[dayIndex] = Array.from({ length: PERIOD_COUNT }, () => "");
      next[dayIndex][periodIndex] = value;
      return next;
    });
  }

  function clearAll() {
    setCells(emptyGrid());
  }

  async function handleDownloadPdf() {
    if (!sheetRef.current || exporting) return;
    setExporting(true);
    try {
      await exportUniversalTimetablePdf(
        sheetRef.current,
        `${t("schedulesPageTitle") || "جدول-الحصص"}.pdf`,
      );
    } catch (err) {
      console.error("[tariq] universal timetable PDF:", err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {!embedded ? (
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-teal">
              {t("universalTimetableBadge")}
            </p>
            <h2 className="mt-1 text-xl font-bold text-fg sm:text-2xl">
              {t("schedulesPageTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted">{t("universalTimetableLead")}</p>
          </div>
        ) : (
          <p className="min-w-0 flex-1 text-sm text-muted">
            {t("universalTimetableEditableLead")}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white/5 px-3 text-sm font-semibold text-muted transition hover:border-rose-400/40 hover:text-rose-300"
          >
            <Eraser className="size-4" aria-hidden />
            {t("universalTimetableClear")}
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => void handleDownloadPdf()}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-500 disabled:opacity-60"
            aria-label={t("downloadTimetablePdf")}
          >
            <Download className="size-4" aria-hidden />
            {exporting ? t("teacherExportingPdf") : t("downloadTimetablePdf")}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/90 shadow-elevated backdrop-blur-xl">
        <div
          ref={sheetRef}
          dir="rtl"
          className="bg-[#0b1220] p-4 text-white sm:p-5"
          style={{ fontFamily: "Tahoma, Arial, sans-serif" }}
        >
          <div className="mb-4 flex items-start justify-between gap-3 border-b border-emerald-500/30 pb-3">
            <div>
              <p className="text-[11px] tracking-[0.2em] text-emerald-300">
                {t("brandName")}
              </p>
              <h3 className="mt-1 text-lg font-extrabold sm:text-xl">
                {t("schedulesPageTitle")}
              </h3>
              <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                {t("universalTimetableSubtitle")}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-500/15 px-3 py-2 text-[11px] font-semibold text-emerald-200">
              7 × 7
            </div>
          </div>

          <div className="-mx-1 overflow-x-auto px-1">
            <table className="min-w-[760px] w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="border border-emerald-500/30 bg-emerald-500/20 px-2 py-2.5 text-emerald-100">
                    {t("teacherPeriod")}
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="border border-emerald-500/30 bg-emerald-500/20 px-2 py-2.5 text-emerald-100"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {UNIVERSAL_PERIODS.map((period, periodIndex) => (
                  <tr key={period}>
                    <th className="border border-emerald-500/20 bg-white/5 px-2 py-2 font-bold text-emerald-200">
                      {period}
                    </th>
                    {days.map((day, dayIndex) => {
                      const value = cells[dayIndex]?.[periodIndex] ?? "";
                      return (
                        <td
                          key={`${day}-${period}`}
                          className="border border-emerald-500/20 p-1 align-middle"
                        >
                          <input
                            type="text"
                            value={value}
                            onChange={(e) =>
                              setCell(dayIndex, periodIndex, e.target.value)
                            }
                            placeholder={t("universalTimetableCellPlaceholder")}
                            aria-label={`${day} — ${t("teacherPeriod")} ${period}`}
                            className="w-full min-w-[4.5rem] rounded-md border border-transparent bg-slate-900/70 px-1.5 py-2 text-center text-[11px] text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-500/50 focus:bg-slate-900 sm:text-xs"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
