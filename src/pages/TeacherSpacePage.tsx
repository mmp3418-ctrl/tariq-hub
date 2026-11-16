import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  CalendarRange,
  ChevronDown,
  Clapperboard,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  LayoutGrid,
  Megaphone,
  MonitorPlay,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { SpotlightCard } from "../components/ui/SpotlightCard.tsx";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import { usePulse, useStages } from "../services/hooks/useCurriculum.ts";
import {
  digitalTools,
  pacingByStage,
  scheduleSlots,
  supervisorNotes,
  templateBlob,
  teacherTemplates,
  weekDaysAr,
  weekDaysEn,
  type TeacherTemplate,
} from "../services/teacherContent.ts";
import type { StageId } from "../services/types.ts";

const PLANNER_KEY = "tariq-teacher-planner-v1";

type PlannerMap = Record<string, string>;

function loadPlanner(): PlannerMap {
  try {
    const raw = localStorage.getItem(PLANNER_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PlannerMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function TeacherSpacePage() {
  const { t, locale, dir } = usePreferences();
  const stages = useStages();
  const pulse = usePulse();
  const reduce = useReducedMotion();
  usePageTitle(t("teacherSpace"));

  const [openStage, setOpenStage] = useState<StageId | null>("primary");
  const [preview, setPreview] = useState<TeacherTemplate | null>(null);
  const [planner, setPlanner] = useState<PlannerMap>(() => (typeof window === "undefined" ? {} : loadPlanner()));
  const [savedFlash, setSavedFlash] = useState(false);
  const plannerReady = useRef(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedback, setFeedback] = useState({
    name: "",
    email: "",
    type: "curriculum",
    message: "",
  });

  const days = locale === "en" ? weekDaysEn : weekDaysAr;
  const activePlans = useMemo(() => Object.values(planner).filter(Boolean).length, [planner]);

  useEffect(() => {
    if (!plannerReady.current) {
      plannerReady.current = true;
      return;
    }
    try {
      localStorage.setItem(PLANNER_KEY, JSON.stringify(planner));
      setSavedFlash(true);
      const timer = window.setTimeout(() => setSavedFlash(false), 1200);
      return () => window.clearTimeout(timer);
    } catch {
      /* ignore */
    }
  }, [planner]);

  const stats = [
    { label: t("teacherStatPlans"), value: activePlans },
    { label: t("teacherStatMaterials"), value: pulse.notes + pulse.playlists },
    { label: t("teacherStatReach"), value: Math.max(pulse.grades * 28, 120) },
  ];

  const jumps = [
    { href: "#teacher-pacing", label: t("teacherJumpPacing"), icon: CalendarRange },
    { href: "#teacher-templates", label: t("teacherJumpTemplates"), icon: ClipboardList },
    { href: "#teacher-tools", label: t("teacherJumpTools"), icon: MonitorPlay },
    { href: "#teacher-planner", label: t("teacherJumpPlanner"), icon: LayoutGrid },
    { href: "#teacher-feedback", label: t("teacherJumpFeedback"), icon: Send },
  ];

  const kindLabel = (kind: TeacherTemplate["kind"]) => {
    if (kind === "plan") return t("teacherKindPlan");
    if (kind === "exam") return t("teacherKindExam");
    return t("teacherKindRubric");
  };

  const downloadTemplate = (template: TeacherTemplate) => {
    const blob = templateBlob(template, locale);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = template.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const onFeedback = (event: FormEvent) => {
    event.preventDefault();
    if (!feedback.name.trim() || !feedback.email.trim() || !feedback.message.trim()) return;
    setFeedbackSent(true);
  };

  return (
    <Shell className="pb-20">
      <Folio index="05" label={t("folioTeacher")} />

      {/* Dashboard header */}
      <header className="surface-dark overflow-hidden rounded-2xl shadow-elevated">
        <div className="grid gap-8 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-12 lg:px-12 lg:py-14">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 font-display text-[11px] tracking-[0.22em] text-emerald">
              <GraduationCap className="size-3.5" />
              {t("teacherEyebrow")}
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-white md:text-5xl">{t("teacherGreeting")}</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-soft sm:text-base sm:leading-8">{t("teacherGreetingLead")}</p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <Link
                to="/library"
                className="brand-gradient inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
              >
                <BookOpen className="size-4" />
                {t("teacherCtaLibrary")}
              </Link>
              <Link
                to="/playlists"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
              >
                <Clapperboard className="size-4" />
                {t("teacherCtaPlaylists")}
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 lg:col-span-5 lg:content-end">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduce ? 0 : 0.06 * index }}
                className="rounded-2xl border border-white/15 bg-white/10 px-3 py-4 backdrop-blur-sm"
              >
                <p className="text-[11px] text-soft">{stat.label}</p>
                <p className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </header>

      {/* Jump links */}
      <nav className="mt-5 flex gap-2 overflow-x-auto pb-1" aria-label={t("teacherSpace")}>
        {jumps.map((jump) => (
          <a
            key={jump.href}
            href={jump.href}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-elevated transition hover:border-emerald/40 hover:text-teal dark:bg-slate-900 dark:text-slate-200"
          >
            <jump.icon className="size-3.5 text-teal" />
            {jump.label}
          </a>
        ))}
      </nav>

      {/* Supervisor announcements */}
      <section className="glass mt-6 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <span className="relative inline-flex size-8 items-center justify-center rounded-full bg-emerald-500/15 text-teal">
            <span className="absolute size-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
            <Megaphone className="relative size-3.5" />
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("teacherSupervisor")}</h2>
        </div>
        <ul className="mt-4 grid gap-3 lg:grid-cols-2">
          {supervisorNotes.map((note) => (
            <li key={note.id} className="rounded-xl border border-line bg-surface/70 px-4 py-3">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {locale === "en" ? note.titleEn : note.titleAr}
              </p>
              <p className="mt-1 text-sm leading-7 text-muted">{locale === "en" ? note.bodyEn : note.bodyAr}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Pacing guides */}
      <section id="teacher-pacing" className="mt-10 scroll-mt-28">
        <div className="mb-5 max-w-2xl">
          <p className="text-sm text-teal">{t("teacherPacing")}</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">{t("teacherPacingTitle")}</h2>
          <p className="mt-2 text-sm leading-7 text-muted">{t("teacherPacingLead")}</p>
        </div>
        <div className="space-y-3">
          {stages.map((stage) => {
            const open = openStage === stage.id;
            const weeks = pacingByStage[stage.id];
            return (
              <div key={stage.id} className={`glass overflow-hidden rounded-2xl ${open ? "glow-ring" : ""}`}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenStage(open ? null : stage.id)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-start sm:px-5 sm:py-5"
                >
                  <span>
                    <span className="font-display text-xs tracking-[0.16em] text-teal">{stage.index}</span>
                    <span className="mt-1 block text-lg font-bold text-slate-900 sm:text-xl dark:text-white">{stage.title}</span>
                    <span className="mt-1 block text-sm text-muted">{stage.summary}</span>
                  </span>
                  <span
                    className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line ${
                      open ? "brand-gradient text-white" : "bg-emerald-500/10 text-teal"
                    }`}
                  >
                    <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: reduce ? 0 : 0.22 }}>
                      <ChevronDown className="size-5" />
                    </motion.span>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.28 }}
                      className="overflow-hidden border-t border-line"
                    >
                      <ul className="grid gap-2 p-3 sm:grid-cols-2">
                        {weeks.map((week) => (
                          <li key={week.week} className="rounded-xl border border-line bg-surface/80 px-4 py-3">
                            <p className="font-display text-[11px] tracking-[0.14em] text-teal">
                              {t("teacherWeek")} {week.week}
                            </p>
                            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                              {locale === "en" ? week.titleEn : week.titleAr}
                            </p>
                            <p className="mt-1 text-xs leading-6 text-muted">
                              {locale === "en" ? week.focusEn : week.focusAr}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Templates */}
      <section id="teacher-templates" className="mt-12 scroll-mt-28">
        <div className="mb-5 max-w-2xl">
          <p className="text-sm text-teal">{t("teacherPlanning")}</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">{t("teacherTemplatesTitle")}</h2>
          <p className="mt-2 text-sm leading-7 text-muted">{t("teacherTemplatesLead")}</p>
        </div>
        <ul className="grid gap-3 lg:grid-cols-3">
          {teacherTemplates.map((template) => (
            <li key={template.id}>
              <SpotlightCard className="glass h-full rounded-2xl transition hover:-translate-y-0.5">
                <div className="flex h-full flex-col p-5">
                  <span className="inline-flex w-fit rounded-full border border-emerald/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-teal">
                    {kindLabel(template.kind)}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                    {locale === "en" ? template.titleEn : template.titleAr}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-7 text-muted">
                    {locale === "en" ? template.detailEn : template.detailAr}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPreview(template)}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-semibold text-slate-800 dark:text-white"
                    >
                      <FileText className="size-3.5 text-teal" />
                      {t("teacherViewTemplate")}
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadTemplate(template)}
                      className="brand-gradient inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-white"
                    >
                      <Download className="size-3.5" />
                      {t("teacherDownloadTemplate")}
                    </button>
                  </div>
                </div>
              </SpotlightCard>
            </li>
          ))}
        </ul>
      </section>

      {/* Digital tools */}
      <section id="teacher-tools" className="mt-12 scroll-mt-28">
        <div className="mb-5 max-w-2xl">
          <p className="text-sm text-teal">{t("teacherResources")}</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">{t("teacherToolsTitle")}</h2>
          <p className="mt-2 text-sm leading-7 text-muted">{t("teacherToolsLead")}</p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-3">
          {digitalTools.map((tool) => (
            <li key={tool.id}>
              <SpotlightCard className="glass h-full rounded-2xl">
                <div className="flex h-full flex-col p-5">
                  <Sparkles className="size-5 text-teal" />
                  <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                    {locale === "en" ? tool.titleEn : tool.titleAr}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-7 text-muted">
                    {locale === "en" ? tool.detailEn : tool.detailAr}
                  </p>
                  <a
                    href={tool.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal"
                  >
                    {t("teacherOpenTool")}
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </SpotlightCard>
            </li>
          ))}
        </ul>
      </section>

      {/* Schedule planner */}
      <section id="teacher-planner" className="glass mt-12 scroll-mt-28 rounded-2xl p-4 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-2xl">
            <p className="text-sm text-teal">{t("teacherPlannerTitle")}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{t("teacherPlannerTitle")}</h2>
            <p className="mt-2 text-sm leading-7 text-muted">{t("teacherPlannerLead")}</p>
          </div>
          <div className="flex items-center gap-2">
            {savedFlash ? <span className="text-xs font-semibold text-teal">{t("teacherSaved")}</span> : null}
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
                <th className="border border-line bg-surface px-2 py-2 text-start font-semibold text-muted">{t("teacherPeriod")}</th>
                {days.map((day) => (
                  <th key={day} className="border border-line bg-surface px-2 py-2 text-start font-semibold text-slate-800 dark:text-white">
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

      {/* Feedback */}
      <section id="teacher-feedback" className="mt-12 scroll-mt-28">
        <div className="mb-5 max-w-2xl">
          <p className="text-sm text-teal">{t("teacherFeedbackTitle")}</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">{t("teacherFeedbackTitle")}</h2>
          <p className="mt-2 text-sm leading-7 text-muted">{t("teacherFeedbackLead")}</p>
        </div>

        <div className="glass rounded-2xl p-5 sm:p-8">
          {feedbackSent ? (
            <div className="py-8 text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">{t("teacherFeedbackSuccess")}</p>
              <button
                type="button"
                className="brand-gradient mt-6 inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-white"
                onClick={() => {
                  setFeedbackSent(false);
                  setFeedback({ name: "", email: "", type: "curriculum", message: "" });
                }}
              >
                {t("teacherFeedbackReset")}
              </button>
            </div>
          ) : (
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={onFeedback}>
              <label className="block text-sm">
                <span className="mb-1.5 block font-semibold text-slate-800 dark:text-slate-100">{t("teacherFeedbackName")}</span>
                <input
                  required
                  value={feedback.name}
                  onChange={(event) => setFeedback((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald/50 dark:text-white"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-semibold text-slate-800 dark:text-slate-100">{t("teacherFeedbackEmail")}</span>
                <input
                  required
                  type="email"
                  value={feedback.email}
                  onChange={(event) => setFeedback((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald/50 dark:text-white"
                  dir="ltr"
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1.5 block font-semibold text-slate-800 dark:text-slate-100">{t("teacherFeedbackType")}</span>
                <select
                  value={feedback.type}
                  onChange={(event) => setFeedback((current) => ({ ...current, type: event.target.value }))}
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald/50 dark:text-white"
                >
                  <option value="curriculum">{t("teacherFeedbackTypeCurriculum")}</option>
                  <option value="resource">{t("teacherFeedbackTypeResource")}</option>
                  <option value="tech">{t("teacherFeedbackTypeTech")}</option>
                </select>
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1.5 block font-semibold text-slate-800 dark:text-slate-100">{t("teacherFeedbackMessage")}</span>
                <textarea
                  required
                  rows={5}
                  value={feedback.message}
                  onChange={(event) => setFeedback((current) => ({ ...current, message: event.target.value }))}
                  className="w-full resize-y rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald/50 dark:text-white"
                />
              </label>
              <div className="sm:col-span-2">
                <button type="submit" className="brand-gradient inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white">
                  <Send className="size-4" />
                  {t("teacherFeedbackSubmit")}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Template preview modal */}
      <AnimatePresence>
        {preview ? (
          <motion.div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-4" role="presentation">
            <motion.button
              type="button"
              aria-label={t("closePreview")}
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreview(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-lg overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-elevated sm:rounded-2xl dark:border-slate-700 dark:bg-slate-900"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: 12 }}
            >
              <div className="border-b border-line px-5 py-4">
                <p className="text-xs font-semibold text-teal">{kindLabel(preview.kind)}</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  {locale === "en" ? preview.titleEn : preview.titleAr}
                </h3>
              </div>
              <pre className="max-h-[50vh] overflow-auto whitespace-pre-wrap px-5 py-4 text-sm leading-7 text-slate-700 dark:text-slate-200">
                {locale === "en"
                  ? `${preview.titleEn}\n\n${preview.detailEn}\n\nObjective:\nMaterials:\nSteps:\nAssessment:`
                  : `${preview.titleAr}\n\n${preview.detailAr}\n\nالهدف:\nالوسائل:\nالخطوات:\nالتقويم:`}
              </pre>
              <div className="flex flex-wrap gap-2 border-t border-line px-5 py-4">
                <button
                  type="button"
                  onClick={() => downloadTemplate(preview)}
                  className="brand-gradient inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-white"
                >
                  <Download className="size-3.5" />
                  {t("teacherDownloadTemplate")}
                </button>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="inline-flex min-h-10 items-center rounded-lg border border-line px-3 text-sm font-semibold text-slate-800 dark:text-white"
                >
                  {t("closePreview")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Shell>
  );
}
