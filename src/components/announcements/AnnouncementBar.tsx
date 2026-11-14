import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Megaphone, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePreferences } from "../../lib/preferences.tsx";
import { useAnnouncements } from "../../services/hooks/useCurriculum.ts";

const DISMISS_KEY = "tariq-announcement-dismissed";

export function AnnouncementBar() {
  const announcements = useAnnouncements();
  const { locale, t } = usePreferences();
  const reduce = useReducedMotion();
  const active = useMemo(() => announcements.find((item) => item.is_active) ?? null, [announcements]);
  const [dismissedId, setDismissedId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(DISMISS_KEY);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (active && dismissedId && dismissedId !== active.id) {
      setDismissedId(null);
    }
  }, [active, dismissedId]);

  const visible = Boolean(active && dismissedId !== active.id);
  const message = active ? (locale === "en" ? active.message_en : active.message_ar) : "";

  const dismiss = () => {
    if (!active) return;
    setDismissedId(active.id);
    try {
      localStorage.setItem(DISMISS_KEY, active.id);
    } catch {
      /* ignore */
    }
  };

  return (
    <AnimatePresence initial={false}>
      {visible && active ? (
        <motion.div
          key={active.id}
          initial={reduce ? false : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={reduce ? undefined : { height: 0, opacity: 0 }}
          className="overflow-hidden border-b border-emerald/20 bg-emerald/10"
        >
          <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-2.5 sm:items-center sm:px-6 lg:px-8">
            <span className="relative mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald/15 text-teal sm:mt-0">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald/30" />
              <Megaphone className="relative size-3.5" />
            </span>
            <p className="min-w-0 flex-1 text-sm leading-6 text-fg">
              <span className="me-2 font-semibold text-teal">{t("liveUpdate")}</span>
              {message}
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-emerald/15 hover:text-fg"
              aria-label={t("dismissAnnouncement")}
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
