import { BookOpen, Clapperboard, FileDown, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ActiveSchedulesBoard } from "../components/schedules/ActiveSchedulesBoard.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import {
  fetchTeacherSchedule,
  getTeacherScheduleOwner,
  isSupabaseConfigured,
  supabase,
  upsertTeacherSchedule,
  type TeacherPlannerMap,
} from "../lib/supabase.ts";
import { scheduleSlots, weekDaysAr, weekDaysEn } from "../services/teacherContent.ts";

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

export function TeacherSpacePage() {
  const { t, locale, dir } = usePreferences();
  usePageTitle(t("teacherSpace"));

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
      const { exportTeacherSchedulePdf } = await import("../lib/exportTeacherSchedulePdf.ts");
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
    <Shell className="overflow-x-hidden pb-20">
      <Folio index="05" label={t("folioTeacher")} />

      <header className="surface-dark overflow-hidden rounded-2xl px-5 py-8 shadow-elevated sm:px-8 sm:py-10">
        <p className="font-display text-[11px] tracking-[0.22em] text-emerald">{t("teacherPortalBadge")}</p>
        <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">{t("teacherHeading")}</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-soft sm:text-base">{t("teacherSpaceLead")}</p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link
            to="/teacher-space/playlists"
            className="brand-gradient inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-[0_14px_36px_-16px_rgba(16,185,129,1)]"
          >
            <Clapperboard className="size-4" />
            {t("teacherAllPlaylists")}
          </Link>
          <Link
            to="/teacher-space/library"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            <BookOpen className="size-4" />
            {t("teacherAllLibrary")}
          </Link>
        </div>
      </header>

      <section className="glass mt-8 overflow-hidden rounded-2xl p-4 sm:p-6">
        <p className="text-sm text-teal">{t("activeSchedulesKicker")}</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">{t("activeSchedulesTitle")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{t("activeSchedulesLead")}</p>
        <ActiveSchedulesBoard />
      </section>

      <section className="glass mt-8 overflow-hidden rounded-2xl p-4 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-teal">{t("teacherPlannerTitle")}</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">{t("teacherScheduleTitle")}</h2>
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

        <div className="mt-5 overflow-x-auto">
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
                          className="w-full rounded-md border border-transparent bg-white px-2 py-2 text-xs text-slate-900 outline-none ring-emerald/30 placeholder:text-slate-400 focus:border-emerald/40 focus:ring-2 dark:bg-slate-950 dark:text-white"
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
    </Shell>
  );
}
