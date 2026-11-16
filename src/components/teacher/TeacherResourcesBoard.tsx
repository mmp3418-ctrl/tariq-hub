import { ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ComingSoonBadge } from "../ui/ComingSoonBadge.tsx";
import { fetchTeacherResources, supabase, type DbTeacherResource } from "../../lib/supabase.ts";
import { usePreferences } from "../../lib/preferences.tsx";

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

export function TeacherResourcesBoard() {
  const { t, locale } = usePreferences();
  const [items, setItems] = useState<DbTeacherResource[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchTeacherResources().then((rows) => {
      if (cancelled) return;
      setItems(rows ?? []);
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
      .channel("tariq-teacher-resources")
      .on("postgres_changes", { event: "*", schema: "public", table: "teacher_resources" }, () => {
        void fetchTeacherResources().then((rows) => {
          if (rows) setItems(rows);
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "teacher_space_items" }, () => {
        void fetchTeacherResources().then((rows) => {
          if (rows) setItems(rows);
        });
      })
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, []);

  const grouped = useMemo(() => {
    return CATEGORIES.map((category) => ({
      ...category,
      items: items
        .filter((item) => item.category === category.value)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    }));
  }, [items]);

  return (
    <section className="glass overflow-hidden rounded-2xl p-4 sm:p-6">
      <p className="text-sm text-teal">{t("teacherResourcesTitle")}</p>
      <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">{t("teacherResourcesTitle")}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{t("teacherResourcesLead")}</p>

      {!ready ? (
        <div className="mt-5 h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {grouped.map((group) => (
            <div key={group.value} className="rounded-xl border border-line p-4">
              <h3 className="text-sm font-bold text-teal">{t(group.key)}</h3>
              {group.items.length === 0 ? (
                <p className="mt-3 text-sm text-muted">{t("noResults")}</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {group.items.map((item) => {
                    const soon = Boolean(item.is_coming_soon);
                    const href = itemUrl(item);
                    return (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {itemTitle(item, locale)}
                          </p>
                          {itemDescription(item, locale) ? (
                            <p className="mt-1 line-clamp-2 text-xs text-muted">{itemDescription(item, locale)}</p>
                          ) : null}
                          {soon ? <ComingSoonBadge className="mt-2" /> : null}
                        </div>
                        {soon || !href ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                            <ExternalLink className="size-3.5" />
                            {t("openResource")}
                          </span>
                        ) : (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-teal"
                          >
                            <ExternalLink className="size-3.5" />
                            {t("openResource")}
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
