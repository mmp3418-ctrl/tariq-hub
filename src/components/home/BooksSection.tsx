import { BookOpen, Download, ExternalLink } from "lucide-react";
import { usePreferences } from "../../lib/preferences.tsx";
import type { HomeBook } from "../../services/homeContent.ts";
import { ExternalAnchor } from "../ui/ExternalAnchor.tsx";
import { Shell } from "../ui/Shell.tsx";

type BooksSectionProps = {
  books: HomeBook[];
  ready: boolean;
};

export function BooksSection({ books, ready }: BooksSectionProps) {
  const { t } = usePreferences();
  const list = Array.isArray(books) ? books : [];

  if (!ready) {
    return (
      <Shell className="mt-10 sm:mt-14">
        <div className="mb-6 max-w-2xl">
          <p className="text-sm text-teal">{t("booksEyebrow")}</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
            {t("booksHeading")}
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="glass h-48 animate-pulse rounded-2xl border border-line"
              aria-hidden
            />
          ))}
        </div>
      </Shell>
    );
  }

  if (list.length === 0) return null;

  return (
    <Shell className="mt-10 sm:mt-14">
      <div className="mb-6 max-w-2xl">
        <p className="text-sm text-teal">{t("booksEyebrow")}</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
          {t("booksHeading")}
        </h2>
        <p className="mt-2 text-sm leading-7 text-muted sm:text-base">{t("booksLead")}</p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((book) => (
          <li key={book.id}>
            <article className="glass theme-ease flex h-full flex-col overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-24px_rgba(16,185,129,0.55)]">
              <div className="relative aspect-[4/3] bg-slate-900/5 dark:bg-white/5">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt=""
                    className="size-full object-cover"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-teal">
                    <BookOpen className="size-10 opacity-70" aria-hidden />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{book.title}</h3>
                  {book.description ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted">{book.description}</p>
                  ) : null}
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                  {book.price ? (
                    <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-teal">
                      {book.price}
                    </span>
                  ) : null}
                  {book.downloadUrl ? (
                    <ExternalAnchor
                      href={book.downloadUrl}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold text-slate-800 transition hover:border-emerald/40 hover:text-teal dark:text-slate-100"
                    >
                      <Download className="size-3.5" />
                      {t("booksDownload")}
                      <ExternalLink className="size-3 opacity-60" />
                    </ExternalAnchor>
                  ) : null}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
