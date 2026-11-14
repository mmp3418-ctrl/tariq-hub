import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { SiteFooter } from "../components/navigation/SiteFooter.tsx";
import { SiteNav } from "../components/navigation/SiteNav.tsx";
import { RouteProgress } from "../components/progress/RouteProgress.tsx";

export function RootLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const reduce = useReducedMotion();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [location.pathname]);

  return (
    <div className="flex min-h-svh flex-col bg-surface theme-ease">
      <RouteProgress />
      <SiteNav />
      <main id="main" tabIndex={-1} className="flex-1 pt-24 outline-none sm:pt-28">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
      <SiteFooter />
    </div>
  );
}
