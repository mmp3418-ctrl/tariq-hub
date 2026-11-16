import { useEffect, useMemo, useState } from "react";
import { fetchActiveTeacherSchedules, supabase, type DbTeacherSchedule } from "../../lib/supabase.ts";
import { usePreferences } from "../../lib/preferences.tsx";
import { weekDaysAr, weekDaysEn } from "../../services/teacherContent.ts";

const PERIODS = [1, 2, 3, 4, 5, 6, 7];

export function ActiveSchedulesBoard() {
  const { t, locale } = usePreferences();
  const [rows, setRows] = useState<DbTeacherSchedule[]>([]);
  const [ready, setReady] = useState(false);
  const days = locale === "en" ? weekDaysEn : weekDaysAr;

  useEffect(() => {
    let cancelled = false;
    void fetchActiveTeacherSchedules().then((data) => {
      if (cancelled) return;
      setRows(data ?? []);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const channel = client
      .channel("tariq-active-schedules")
      .on("postgres_changes", { event: "*", schema: "public", table: "teacher_schedules" }, () => {
        void fetchActiveTeacherSchedules().then((data) => {
          if (data) setRows(data);
        });
      })
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, []);

  const teachers = useMemo(() => {
    const names = [...new Set(rows.map((row) => row.teacher_name))];
    return names.sort((a, b) => a.localeCompare(b, locale === "ar" ? "ar" : "en"));
  }, [locale, rows]);

  if (!ready) {
    return <div className="mt-6 h-40 animate-pulse rounded-2xl border border-line bg-slate-100 dark:bg-slate-900" />;
  }

  if (teachers.length === 0) {
    return (
      <p className="mt-4 text-sm leading-7 text-muted">{t("noActiveSchedules")}</p>
    );
  }

  return (
    <div className="mt-5 space-y-6">
      {teachers.map((teacher) => {
        const teacherRows = rows.filter((row) => row.teacher_name === teacher);
        const map = new Map(
          teacherRows.map((row) => [`${row.day_of_week}-${row.period_number}`, row] as const),
        );
        return (
          <div key={teacher} className="overflow-x-auto rounded-2xl border border-line">
            <div className="border-b border-line bg-surface px-4 py-3">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{teacher}</p>
            </div>
            <table className="min-w-[640px] w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-line bg-navy px-2 py-2 text-start font-semibold text-white">
                    {t("teacherPeriod")}
                  </th>
                  {days.map((day) => (
                    <th key={day} className="border border-line bg-navy px-2 py-2 text-start font-semibold text-white">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period) => (
                  <tr key={period}>
                    <td className="border border-line px-2 py-2 font-display text-xs text-teal">{period}</td>
                    {days.map((_, dayIndex) => {
                      const cell = map.get(`${dayIndex}-${period}`);
                      return (
                        <td key={`${dayIndex}-${period}`} className="border border-line px-2 py-2 align-top">
                          {cell ? (
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900 dark:text-white">{cell.subject}</p>
                              <p className="truncate text-xs text-muted">{cell.class_name}</p>
                            </div>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
