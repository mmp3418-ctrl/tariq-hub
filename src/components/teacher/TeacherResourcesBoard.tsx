import { ChevronDown, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { ComingSoonBadge } from "../ui/ComingSoonBadge.tsx";
import { isRowComingSoon, type DbTeacherResource } from "../../lib/supabase.ts";
import { usePreferences } from "../../lib/preferences.tsx";
import { useGrades, useUnitsByGrade } from "../../services/hooks/useCurriculum.ts";
import { useTeacherPortal } from "../../services/teacherPortal.tsx";
import type { CurriculumUnit, Grade } from "../../services/types.ts";

const CATEGORIES = [
  { value: "lesson_prep", key: "teacherCatLessonPrep" },
  { value: "worksheets", key: "teacherCatWorksheets" },
  { value: "question_banks", key: "teacherCatQuestionBanks" },
  { value: "grammar_summaries", key: "teacherCatGrammar" },
  { value: "classroom_guide", key: "teacherCatClassroom" },
] as const;

function itemTitle(item: DbTeacherResource, locale: "ar" | "en") {
  if (locale === "en") return (item.title_en || item.title || item.title_ar || "").trim();
  return (item.title_ar || item.title || item.title_en || "").trim();
}

function itemDescription(item: DbTeacherResource, locale: "ar" | "en") {
  if (locale === "en") return (item.description_en || item.description || item.description_ar || "").trim();
  return (item.description_ar || item.description || item.description_en || "").trim();
}

function itemUrl(item: DbTeacherResource) {
  return (item.url || item.file_url || "").trim();
}

function gradeDbKey(grade: Grade) {
  return grade.dbId || grade.id;
}

function ResourceList({
  items,
  locale,
  t,
}: {
  items: DbTeacherResource[];
  locale: "ar" | "en";
  t: (key: string) => string;
}) {
  if (items.length === 0) {
    return <p className="mt-2 text-sm text-muted">{t("noResults")}</p>;
  }

  return (
    <ul className="mt-2 space-y-2">
      {items.map((item) => {
        const soon = isRowComingSoon(item);
        const href = itemUrl(item);
        return (
          <li
            key={item.id}
            className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-lg border border-line px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-fg">
                {itemTitle(item, locale)}
              </p>
              {itemDescription(item, locale) ? (
                <p className="mt-1 line-clamp-2 text-xs text-muted">{itemDescription(item, locale)}</p>
              ) : null}
              {soon ? <ComingSoonBadge className="mt-2" /> : null}
            </div>
            {soon || !href ? (
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-400">
                <ExternalLink className="size-3.5" />
                {t("openResource")}
              </span>
            ) : (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-teal"
              >
                <ExternalLink className="size-3.5" />
                {t("openResource")}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function UnitBlock({
  unit,
  items,
  locale,
  t,
}: {
  unit: CurriculumUnit | { id: string; title: string; isComingSoon?: boolean };
  items: DbTeacherResource[];
  locale: "ar" | "en";
  t: (key: string) => string;
}) {
  const [open, setOpen] = useState(true);
  const byCategory = CATEGORIES.map((category) => ({
    ...category,
    items: items
      .filter((item) => item.category === category.value)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
  })).filter((group) => group.items.length > 0);

  const uncategorized = items
    .filter((item) => !CATEGORIES.some((category) => category.value === item.category))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full min-w-0 items-center justify-between gap-3 bg-surface px-3 py-3 text-start sm:px-4"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-fg">{unit.title}</p>
          <p className="mt-0.5 text-xs text-muted">
            {items.length} · {t("teacherResourcesTitle")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {unit.isComingSoon ? <ComingSoonBadge /> : null}
          <ChevronDown className={`size-4 text-teal transition ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open ? (
        <div className="space-y-3 border-t border-line p-3 sm:p-4">
          {byCategory.map((group) => (
            <div key={group.value} className="min-w-0">
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-teal">
                {t(group.key)}
              </span>
              <ResourceList items={group.items} locale={locale} t={t} />
            </div>
          ))}
          {uncategorized.length > 0 ? (
            <div className="min-w-0">
              <span className="rounded-full bg-slate-500/15 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                {t("categoryOther")}
              </span>
              <ResourceList items={uncategorized} locale={locale} t={t} />
            </div>
          ) : null}
          {byCategory.length === 0 && uncategorized.length === 0 ? (
            <p className="text-sm text-muted">{t("noResults")}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function GradeResourcesPanel({
  grade,
  items,
  locale,
  t,
}: {
  grade: Grade;
  items: DbTeacherResource[];
  locale: "ar" | "en";
  t: (key: string) => string;
}) {
  const units = useUnitsByGrade(grade.id);
  const [open, setOpen] = useState(false);

  const gradeItems = useMemo(() => {
    const key = gradeDbKey(grade);
    return items.filter((item) => {
      const gid = (item.grade_id || "").trim();
      return gid === key || gid === grade.id || gid === grade.dbId;
    });
  }, [grade, items]);

  const unitBlocks = useMemo(() => {
    const used = new Set<string>();
    const blocks = units
      .map((unit) => {
        const unitItems = gradeItems.filter((item) => (item.unit_id || "").trim() === unit.id);
        unitItems.forEach((item) => used.add(item.id));
        return { unit, items: unitItems };
      })
      .filter((block) => block.items.length > 0);
    const orphan = gradeItems.filter((item) => !used.has(item.id));
    return { blocks, orphan };
  }, [gradeItems, units]);

  if (gradeItems.length === 0) return null;

  return (
    <article className="overflow-hidden rounded-2xl border border-line">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full min-w-0 items-center justify-between gap-3 px-4 py-4 text-start"
      >
        <div className="min-w-0">
          <p className="font-display text-[11px] tracking-[0.18em] text-teal">{grade.index}</p>
          <h3 className="mt-1 truncate text-lg font-bold text-fg">{grade.title}</h3>
          <p className="mt-1 text-xs text-muted">
            {gradeItems.length} · {t("unitsTitle")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {grade.isComingSoon ? <ComingSoonBadge /> : null}
          <ChevronDown className={`size-4 text-teal transition ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open ? (
        <div className="space-y-3 border-t border-line px-3 pb-4 pt-3 sm:px-4">
          {unitBlocks.blocks.map(({ unit, items: unitItems }) => (
            <UnitBlock key={unit.id} unit={unit} items={unitItems} locale={locale} t={t} />
          ))}
          {unitBlocks.orphan.length > 0 ? (
            <UnitBlock
              unit={{ id: `${grade.id}-general`, title: t("teacherResourcesGeneral") }}
              items={unitBlocks.orphan}
              locale={locale}
              t={t}
            />
          ) : null}
          {unitBlocks.blocks.length === 0 && unitBlocks.orphan.length === 0 ? (
            <p className="text-sm text-muted">{t("noTeacherResourcesGrade")}</p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function TeacherResourcesBoard() {
  const { t, locale } = usePreferences();
  const grades = useGrades();
  const { ready, resources: items } = useTeacherPortal();

  const gradesWithContent = useMemo(() => {
    return grades.filter((grade) => {
      const key = gradeDbKey(grade);
      return items.some((item) => {
        const gid = (item.grade_id || "").trim();
        return gid === key || gid === grade.id || gid === (grade.dbId || "");
      });
    });
  }, [grades, items]);

  const unassigned = useMemo(
    () => items.filter((item) => !(item.grade_id || "").trim()),
    [items],
  );

  const displayGrades = gradesWithContent.length > 0 ? gradesWithContent : grades;

  return (
    <section className="glass overflow-hidden rounded-2xl p-4 sm:p-6">
      <p className="text-sm text-teal">{t("teacherResourcesTitle")}</p>
      <h2 className="mt-1 text-xl font-bold text-fg sm:text-2xl">
        {t("teacherResourcesTitle")}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{t("teacherResourcesByUnitLead")}</p>

      {!ready ? (
        <div className="mt-5 h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />
      ) : (
        <div className="mt-5 space-y-3">
          {displayGrades.map((grade) => (
            <GradeResourcesPanel key={grade.id} grade={grade} items={items} locale={locale} t={t} />
          ))}
          {unassigned.length > 0 ? (
            <UnitBlock
              unit={{ id: "unassigned", title: t("teacherResourcesGeneral") }}
              items={unassigned}
              locale={locale}
              t={t}
            />
          ) : null}
          {items.length === 0 ? <p className="text-sm text-muted">{t("noResults")}</p> : null}
        </div>
      )}
    </section>
  );
}
