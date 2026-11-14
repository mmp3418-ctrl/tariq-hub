import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { usePreferences } from "../../lib/preferences.tsx";
import { useGrades, useStages } from "../../services/hooks/useCurriculum.ts";

export function LearningPath() {
  const stages = useStages();
  const grades = useGrades();
  const { t } = usePreferences();
  const reduce = useReducedMotion();

  return (
    <section className="py-8 sm:py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-teal">{t("learningPath")}</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{t("learningPathHeading")}</h2>
        </div>
        <Link to="/grades" className="hairline-link shrink-0 text-sm font-semibold">
          {t("allGrades")}
        </Link>
      </div>

      <ol className="relative grid gap-4 lg:grid-cols-3">
        <div className="pointer-events-none absolute inset-x-8 top-10 hidden h-px bg-gradient-to-r from-emerald/10 via-emerald/50 to-emerald/10 lg:block" />
        {stages.map((stage, index) => {
          const count = grades.filter((grade) => grade.stageId === stage.id).length;
          return (
            <motion.li
              key={stage.id}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: reduce ? 0 : index * 0.08, duration: 0.35 }}
              className="glass relative rounded-2xl p-5"
            >
              <span className="relative z-10 inline-flex size-10 items-center justify-center rounded-full brand-gradient text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(16,185,129,1)]">
                {stage.index}
              </span>
              <h3 className="mt-4 text-xl font-bold">{stage.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{stage.summary}</p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-teal">
                  {count} {t("statsGrades")}
                </span>
                <Link to={`/grades?stage=${stage.id}`} className="text-sm font-semibold text-teal hover:underline">
                  {t("showGrades")}
                </Link>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
