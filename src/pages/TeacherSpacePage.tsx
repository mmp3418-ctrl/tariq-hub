import {
  BookMarked,
  Calculator,
  CalendarDays,
  Clapperboard,
  Download,
  ExternalLink,
  Eye,
  HelpCircle,
  Play,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PlaylistCover } from "../components/playlists/PlaylistCover.tsx";
import { UniversalTimetable } from "../components/schedules/UniversalTimetable.tsx";
import { GradeCalculator } from "../components/teacher/GradeCalculator.tsx";
import { CatalogSkeleton } from "../components/ui/CatalogSkeleton.tsx";
import { EmptyIcons, EmptyState } from "../components/ui/EmptyState.tsx";
import { ExternalAnchor } from "../components/ui/ExternalAnchor.tsx";
import { Folio } from "../components/ui/Folio.tsx";
import { Shell } from "../components/ui/Shell.tsx";
import { useSiteTimetableActive } from "../hooks/useSiteTimetableActive.ts";
import { usePageTitle } from "../lib/usePageTitle.ts";
import { usePreferences } from "../lib/preferences.tsx";
import { useAcademicCatalog } from "../services/AcademicCatalogProvider.tsx";
import {
  useTeacherSpace,
  type TeacherSpaceSection,
} from "../services/TeacherSpaceProvider.tsx";
import type { QuestionBankView } from "../services/teacherSpace.ts";

function parseSection(value: string | null): TeacherSpaceSection {
  if (
    value === "timetable" ||
    value === "tutorials" ||
    value === "references" ||
    value === "questions" ||
    value === "calculator"
  ) {
    return value;
  }
  return "timetable";
}

function embedUrl(youtubeUrl: string) {
  try {
    const url = new URL(youtubeUrl);
    const list = url.searchParams.get("list");
    if (list) return `https://www.youtube.com/embed/videoseries?list=${list}`;
    const video =
      url.searchParams.get("v") ||
      (url.hostname.includes("youtu.be") ? url.pathname.replace("/", "") : "");
    return video ? `https://www.youtube.com/embed/${video}` : "";
  } catch {
    return "";
  }
}

const OPTION_KEYS = ["a", "b", "c", "d"] as const;

export function TeacherSpacePage() {
  const { t } = usePreferences();
  const { ready: academicReady, stages, grades, gradesByStage } = useAcademicCatalog();
  const {
    ready,
    gradeCalculatorActive,
    tutorials,
    references,
    questions,
    stageName,
    gradeName,
  } = useTeacherSpace();
  const [params, setParams] = useSearchParams();
  const section = parseSection(params.get("section"));
  const [filterStage, setFilterStage] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [activeTutorial, setActiveTutorial] = useState<(typeof tutorials)[0] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const { ready: timetableStatusReady, active: siteTimetableActive } =
    useSiteTimetableActive();
  usePageTitle(t("teacherSpace"));

  useEffect(() => {
    if (!params.get("section")) {
      setParams(
        { section: siteTimetableActive ? "timetable" : "tutorials" },
        { replace: true },
      );
    }
  }, [params, setParams, siteTimetableActive]);

  useEffect(() => {
    if (timetableStatusReady && section === "timetable" && !siteTimetableActive) {
      setParams({ section: "tutorials" }, { replace: true });
    }
  }, [section, setParams, siteTimetableActive, timetableStatusReady]);

  const gradeOptions = useMemo(
    () => (filterStage ? gradesByStage(filterStage) : grades),
    [filterStage, grades, gradesByStage],
  );

  const filteredTutorials = useMemo(
    () =>
      tutorials.filter((item) => {
        if (filterStage && item.stageId !== filterStage) return false;
        if (filterGrade && item.gradeId !== filterGrade) return false;
        return true;
      }),
    [filterGrade, filterStage, tutorials],
  );

  const filteredReferences = useMemo(
    () =>
      references.filter((item) => {
        if (filterStage && item.stageId !== filterStage) return false;
        if (filterGrade && item.gradeId !== filterGrade) return false;
        return true;
      }),
    [filterGrade, filterStage, references],
  );

  const filteredQuestions = useMemo(
    () =>
      questions.filter((item) => {
        if (filterStage && item.stageId !== filterStage) return false;
        if (filterGrade && item.gradeId !== filterGrade) return false;
        return true;
      }),
    [filterGrade, filterStage, questions],
  );

  const tabs: { id: TeacherSpaceSection; label: string; icon: typeof CalendarDays }[] = [
    { id: "timetable", label: t("tsTimetable"), icon: CalendarDays },
    { id: "tutorials", label: t("tsTutorials"), icon: Clapperboard },
    { id: "references", label: t("tsReferences"), icon: BookMarked },
    { id: "questions", label: t("tsQuestions"), icon: HelpCircle },
    { id: "calculator", label: t("tsCalculator"), icon: Calculator },
  ].filter((tab) => tab.id !== "timetable" || siteTimetableActive);

  const loading = !ready || !academicReady || !timetableStatusReady;
  const showStageGradeFilters =
    section !== "calculator" && section !== "timetable";

  return (
    <Shell className="overflow-x-hidden pb-20">
      <Folio index="05" label={t("folioTeacher")} />
      <header className="surface-dark overflow-hidden rounded-2xl px-5 py-8 shadow-elevated sm:px-8 sm:py-10">
        <p className="font-display text-[11px] tracking-[0.22em] text-emerald">
          {t("teacherPortalBadge")}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">{t("teacherHeading")}</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-soft sm:text-base">{t("teacherSpaceLead")}</p>
      </header>

      <div
        role="tablist"
        aria-label={t("teacherSpace")}
        className="mt-8 flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = section === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setParams({ section: tab.id })}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition ${
                active
                  ? "border-emerald/40 bg-emerald-500/15 text-teal"
                  : "border-line text-slate-700 hover:border-emerald/30 dark:text-slate-200"
              }`}
            >
              <Icon className="size-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {showStageGradeFilters ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-muted">{t("stepStages")}</span>
            <select
              value={filterStage}
              onChange={(e) => {
                setFilterStage(e.target.value);
                setFilterGrade("");
              }}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-fg outline-none focus:border-emerald/40"
            >
              <option value="">{t("tsAllStages")}</option>
              {(stages ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-muted">{t("stepGrades")}</span>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-fg outline-none focus:border-emerald/40"
            >
              <option value="">{t("tsAllGrades")}</option>
              {gradeOptions.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      <div className="mt-6">
        {loading ? (
          <CatalogSkeleton rows={3} />
        ) : section === "timetable" && siteTimetableActive ? (
          <div className="glass rounded-2xl p-4 sm:p-5">
            <UniversalTimetable embedded />
          </div>
        ) : section === "tutorials" ? (
          filteredTutorials.length === 0 ? (
            <EmptyState
              icon={EmptyIcons.playlists}
              title={t("tsEmptyTutorials")}
              description={t("tsEmptyLead")}
              tone="soft"
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {filteredTutorials.map((item) => (
                <li key={item.id}>
                  <article className="glass flex h-full flex-col gap-3 overflow-hidden rounded-2xl p-4 sm:p-5">
                    <PlaylistCover src={item.coverImageUrl} title={item.title} />
                    <p className="text-xs text-teal">
                      {[stageName(item.stageId), gradeName(item.gradeId)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <h3 className="text-base font-bold text-fg">{item.title}</h3>
                    <div className="mt-auto flex flex-wrap gap-3 pt-1 text-sm font-semibold">
                      <button
                        type="button"
                        onClick={() => setActiveTutorial(item)}
                        className="inline-flex items-center gap-1.5 text-teal"
                      >
                        <Play className="size-4" />
                        {t("openPlayer")}
                      </button>
                      <ExternalAnchor
                        href={item.youtubeUrl}
                        className="inline-flex items-center gap-1.5 text-fg"
                      >
                        {t("openOnYoutube")}
                        <ExternalLink className="size-3.5 opacity-70" />
                      </ExternalAnchor>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )
        ) : section === "references" ? (
          filteredReferences.length === 0 ? (
            <EmptyState
              icon={EmptyIcons.materials}
              title={t("tsEmptyReferences")}
              description={t("tsEmptyLead")}
              tone="soft"
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {filteredReferences.map((item) => (
                <li key={item.id}>
                  <article className="glass flex h-full flex-col gap-3 rounded-2xl p-4 sm:p-5">
                    <p className="text-xs text-teal">
                      {[stageName(item.stageId), gradeName(item.gradeId)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <h3 className="text-base font-bold text-fg">{item.title}</h3>
                    <div className="mt-auto flex flex-wrap gap-3 pt-1 text-sm font-semibold">
                      <ExternalAnchor
                        href={item.fileUrl}
                        kind="pdf"
                        className="inline-flex items-center gap-1.5 text-teal"
                      >
                        <Eye className="size-4" />
                        {t("quickPreview")}
                      </ExternalAnchor>
                      <ExternalAnchor
                        href={item.fileUrl}
                        kind="pdf"
                        download={`${item.title || "reference"}.pdf`}
                        className="inline-flex items-center gap-1.5 text-fg"
                      >
                        <Download className="size-4" />
                        {t("downloadDirect")}
                      </ExternalAnchor>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )
        ) : section === "questions" ? (
          filteredQuestions.length === 0 ? (
            <EmptyState
              icon={EmptyIcons.stages}
              title={t("tsEmptyQuestions")}
              description={t("tsEmptyLead")}
              tone="soft"
            />
          ) : (
            <QuestionQuiz
              items={filteredQuestions}
              answers={answers}
              revealed={revealed}
              onAnswer={(id, key) => setAnswers((prev) => ({ ...prev, [id]: key }))}
              onReveal={(id) => setRevealed((prev) => ({ ...prev, [id]: true }))}
              stageName={stageName}
              gradeName={gradeName}
              t={t}
            />
          )
        ) : !gradeCalculatorActive ? (
          <EmptyState
            icon={EmptyIcons.stages}
            title={t("tsCalculatorClosed")}
            description={t("tsCalculatorClosedLead")}
            tone="soft"
          />
        ) : (
          <GradeCalculator />
        )}
      </div>

      {activeTutorial ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-navy/75 backdrop-blur-md"
            aria-label={t("closePlayer")}
            onClick={() => setActiveTutorial(null)}
          />
          <div className="glass-strong relative w-full max-w-[min(56rem,100vw)] overflow-hidden rounded-t-2xl sm:rounded-2xl">
            <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0F172A] px-4 py-3 text-white sm:px-5">
              <h2 className="truncate text-lg font-bold">{activeTutorial.title}</h2>
              <button
                type="button"
                onClick={() => setActiveTutorial(null)}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white/80 hover:bg-white/10"
              >
                {t("closePlayer")}
              </button>
            </header>
            <div className="aspect-video bg-black">
              {embedUrl(activeTutorial.youtubeUrl) ? (
                <iframe
                  title={activeTutorial.title}
                  src={embedUrl(activeTutorial.youtubeUrl)}
                  className="size-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex size-full items-center justify-center p-6 text-sm text-white/80">
                  <ExternalAnchor href={activeTutorial.youtubeUrl} className="text-emerald">
                    {t("openOnYoutube")}
                  </ExternalAnchor>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}

function QuestionQuiz({
  items,
  answers,
  revealed,
  onAnswer,
  onReveal,
  stageName,
  gradeName,
  t,
}: {
  items: QuestionBankView[];
  answers: Record<string, string>;
  revealed: Record<string, boolean>;
  onAnswer: (id: string, key: string) => void;
  onReveal: (id: string) => void;
  stageName: (id: string) => string;
  gradeName: (id: string) => string;
  t: (key: string) => string;
}) {
  const labels: Record<(typeof OPTION_KEYS)[number], string> = {
    a: "أ",
    b: "ب",
    c: "ج",
    d: "د",
  };

  return (
    <ul className="space-y-4">
      {items.map((item, index) => {
        const selected = answers[item.id];
        const show = revealed[item.id];
        const options: Record<(typeof OPTION_KEYS)[number], string> = {
          a: item.optionA,
          b: item.optionB,
          c: item.optionC,
          d: item.optionD,
        };
        return (
          <li key={item.id} className="glass rounded-2xl p-4 sm:p-5">
            <p className="text-xs text-teal">
              {[stageName(item.stageId), gradeName(item.gradeId)].filter(Boolean).join(" · ")}
            </p>
            <h3 className="mt-2 text-base font-bold text-fg">
              {index + 1}. {item.questionText}
            </h3>
            <div className="mt-4 grid gap-2">
              {OPTION_KEYS.map((key) => {
                const text = options[key];
                if (!text || text === "—") return null;
                const isSelected = selected === key;
                const isCorrect = item.correctAnswer === key;
                let tone = "border-line hover:border-emerald/30";
                if (show && isCorrect) tone = "border-emerald/50 bg-emerald-500/10";
                else if (show && isSelected && !isCorrect) tone = "border-rose-400/50 bg-rose-500/10";
                else if (isSelected) tone = "border-emerald/40 bg-emerald-500/5";
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={show}
                    onClick={() => onAnswer(item.id, key)}
                    className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 text-start text-sm transition ${tone}`}
                  >
                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-bold text-teal">
                      {labels[key]}
                    </span>
                    <span className="pt-0.5 text-fg">{text}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4">
              {!show ? (
                <button
                  type="button"
                  disabled={!selected}
                  onClick={() => onReveal(item.id)}
                  className="rounded-xl bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-teal disabled:opacity-40"
                >
                  {t("tsCheckAnswer")}
                </button>
              ) : (
                <p
                  className={`text-sm font-semibold ${
                    selected === item.correctAnswer ? "text-teal" : "text-rose-500"
                  }`}
                >
                  {selected === item.correctAnswer
                    ? t("tsAnswerCorrect")
                    : `${t("tsAnswerWrong")} (${labels[item.correctAnswer]})`}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
