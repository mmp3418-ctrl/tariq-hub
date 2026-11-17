import { FileDown, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePreferences } from "../../lib/preferences.tsx";
import {
  fetchTeacherSchedule,
  getTeacherScheduleOwner,
  isSupabaseConfigured,
  supabase,
  upsertTeacherSchedule,
  type TeacherPlannerMap,
} from "../../lib/supabase.ts";
import { scheduleSlots, weekDaysAr, weekDaysEn } from "../../services/teacherContent.ts";

const PLANNER_KEY = "tariq-teacher-planner-v1";

function loadPlanner(): TeacherPlannerMap {
  try {
    const raw = localStorage.getItem(PLANNER_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as TeacherPlannerMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function persistPlannerLocal(planner: TeacherPlannerMap) {
  try {
    localStorage.setItem(PLANNER_KEY, JSON.stringify(planner));
  } catch {
    /* ignore */
  }
}

function releaseSyncFlag(flag: { current: boolean }) {
  queueMicrotask(() => {
    flag.current = false;
  });
}

export function TeacherSchedulePlanner() {
  const { t, locale, dir } = usePreferences();
  const [planner, setPlanner] = useState<TeacherPlannerMap>(() =>
    typeof window === "undefined" ? {} : loadPlanner(),
  );
  const [savedFlash, setSavedFlash] = useState(false);
  const [exporting, setExporting] = useState(false);
  const plannerReady = useRef(false);
  const syncingRemote = useRef(false);
  const teacherOwner = useRef(typeof window === "undefined" ? "server" : getTeacherScheduleOwner());
  const days = locale === "en" ? weekDaysEn : weekDaysAr;

  async function handleExportPdf() {
    if (exporting) return;
    setExporting(true);
    try {
      const { exportTeacherSchedulePdf } = await import("../../lib/exportTeacherSchedulePdf.ts");
      await exportTeacherSchedulePdf({
        planner,
        days,
        locale,
        brandName: t("brandName"),
        brandMarkEn: t("brandMarkEn"),
        scheduleTitle: t("teacherScheduleTitle"),
        periodLabel: t("teacherPeriod"),
        emptyCell: t("teacherExportEmpty"),
        fileName: t("teacherExportFile"),
      });
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function hydrateRemote() {
      if (!isSupabaseConfigured) return;
      const remote = await fetchTeacherSchedule(teacherOwner.current);
      if (cancelled || remote === null) return;
      if (Object.keys(remote).length === 0 && Object.keys(loadPlanner()).length > 0) {
        await upsertTeacherSchedule(teacherOwner.current, loadPlanner());
        return;
      }
      syncingRemote.current = true;
      setPlanner(remote);
      persistPlannerLocal(remote);
      releaseSyncFlag(syncingRemote);
    }

    void hydrateRemote();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const channel = client
      .channel(`tariq-teacher-schedule-${teacherOwner.current}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teacher_schedules",
          filter: `teacher_name=eq.${teacherOwner.current}`,
        },
        () => {
          void fetchTeacherSchedule(teacherOwner.current).then((remote) => {
            if (remote === null) return;
            syncingRemote.current = true;
            setPlanner(remote);
            persistPlannerLocal(remote);
            releaseSyncFlag(syncingRemote);
          });
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!plannerReady.current) {
      plannerReady.current = true;
      return;
    }
    if (syncingRemote.current) return;

    persistPlannerLocal(planner);
    setSavedFlash(true);
    const timer = window.setTimeout(() => setSavedFlash(false), 1200);

    if (isSupabaseConfigured) {
      void upsertTeacherSchedule(teacherOwner.current, planner);
    }

    return () => window.clearTimeout(timer);
  }, [planner]);

  return (
    <section className="glass overflow-hidden rounded-2xl p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-teal">{t("teacherPlannerTitle")}</p>
          <h2 className="mt-1 text-xl font-bold text-fg sm:text-2xl">
            {t("teacherScheduleTitle")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{t("schedulesLead")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {savedFlash ? <span className="text-xs font-semibold text-teal">{t("teacherSaved")}</span> : null}
          <button
            type="button"
            onClick={() => void handleExportPdf()}
            disabled={exporting}
            className="brand-gradient inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_-14px_rgba(16,185,129,1)] disabled:cursor-wait disabled:opacity-80"
          >
            <FileDown className="size-3.5" />
            {exporting ? t("teacherExportingPdf") : t("teacherExportPdf")}
          </button>
          <button
            type="button"
            onClick={() => setPlanner({})}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <Trash2 className="size-3.5 text-teal" />
            {t("teacherClearWeek")}
          </button>
        </div>
      </div>

      <div className="mt-5 -mx-1 overflow-x-auto overscroll-x-contain px-1">
        <table className="min-w-[640px] w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-line bg-surface px-2 py-2 text-start font-semibold text-muted">
                {t("teacherPeriod")}
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className="border border-line bg-surface px-2 py-2 text-start font-semibold text-slate-800 dark:text-white"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scheduleSlots.map((slot) => (
              <tr key={slot}>
                <td className="border border-line px-2 py-2 font-display text-xs text-teal">{slot}</td>
                {days.map((_, dayIndex) => {
                  const key = `${dayIndex}-${slot}`;
                  return (
                    <td key={key} className="border border-line p-1.5">
                      <input
                        value={planner[key] ?? ""}
                        onChange={(event) =>
                          setPlanner((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                        placeholder={t("teacherSlotPlaceholder")}
                        className="w-full min-w-0 rounded-md border border-line bg-surface px-2 py-2 text-xs text-fg outline-none ring-emerald/30 placeholder:text-muted focus:border-emerald/40 focus:ring-2"
                        dir={dir}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
