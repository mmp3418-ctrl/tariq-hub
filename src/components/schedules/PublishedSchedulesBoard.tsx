import { useMemo } from "react";
import { ComingSoonBadge } from "../ui/ComingSoonBadge.tsx";
import { usePreferences } from "../../lib/preferences.tsx";
import { useTeacherPortal } from "../../services/teacherPortal.tsx";
import { weekDaysAr, weekDaysEn } from "../../services/teacherContent.ts";
import type { DbClassSchedule, DbTeacherSchedule } from "../../lib/supabase.ts";

const PERIODS = [1, 2, 3, 4, 5, 6, 7];

function ScheduleGrid({
  title,
  rows,
  days,
  periodLabel,
}: {
  title: string;
  rows: Array<DbTeacherSchedule | DbClassSchedule>;
  days: readonly string[];
  periodLabel: string;
}) {
  const map = useMemo(() => {
    const next = new Map<string, DbTeacherSchedule | DbClassSchedule>();
    for (const row of rows) {
      next.set(`${Number(row.day_of_week)}-${Number(row.period_number)}`, row);
    }
    return next;
  }, [rows]);

  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <div className="border-b border-line bg-surface px-4 py-3">
        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{title}</p>
      </div>
      <div className="overflow-x-auto overscroll-x-contain">
        <table className="min-w-[640px] w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-line bg-navy px-2 py-2 text-start font-semibold text-white">
                {periodLabel}
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
                    <td key={`${title}-${dayIndex}-${period}`} className="border border-line px-2 py-2 align-top">
                      {cell ? (
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900 dark:text-white">{cell.subject}</p>
                          {"class_name" in cell && cell.class_name !== title ? (
                            <p className="truncate text-xs text-muted">{cell.class_name}</p>
                          ) : null}
                          {"room" in cell && cell.room ? (
                            <p className="truncate text-[11px] text-muted">{cell.room}</p>
                          ) : null}
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
    </div>
  );
}

export function PublishedSchedulesBoard() {
  const { t, locale } = usePreferences();
  const { ready, teacherSchedules, classSchedules, schedulesVisible } = useTeacherPortal();
  const days = locale === "en" ? weekDaysEn : weekDaysAr;

  const teachers = useMemo(() => {
    const names = [...new Set(teacherSchedules.map((row) => row.teacher_name))];
    return names.sort((a, b) => a.localeCompare(b, locale === "ar" ? "ar" : "en"));
  }, [locale, teacherSchedules]);

  const classes = useMemo(() => {
    const names = [...new Set(classSchedules.map((row) => row.class_name))];
    return names.sort((a, b) => a.localeCompare(b, locale === "ar" ? "ar" : "en"));
  }, [classSchedules, locale]);

  if (!ready) {
    return <div className="mt-4 h-40 animate-pulse rounded-2xl border border-line bg-slate-100 dark:bg-slate-900" />;
  }

  if (!schedulesVisible) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-line px-4 py-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-white">{t("schedulesHiddenTitle")}</p>
          <ComingSoonBadge />
        </div>
        <p className="mt-2 text-sm leading-7 text-muted">{t("schedulesHiddenLead")}</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-5">
      {teachers.map((teacher) => (
        <ScheduleGrid
          key={teacher}
          title={teacher}
          rows={teacherSchedules.filter((row) => row.teacher_name === teacher)}
          days={days}
          periodLabel={t("teacherPeriod")}
        />
      ))}
      {classes.map((className) => (
        <ScheduleGrid
          key={className}
          title={className}
          rows={classSchedules.filter((row) => row.class_name === className)}
          days={days}
          periodLabel={t("teacherPeriod")}
        />
      ))}
    </div>
  );
}
