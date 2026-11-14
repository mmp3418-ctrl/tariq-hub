import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnnouncementBar } from "../components/announcements/AnnouncementBar.tsx";
import { MobileBottomNav } from "../components/navigation/MobileBottomNav.tsx";
import { SiteFooter } from "../components/navigation/SiteFooter.tsx";
import { SiteNav } from "../components/navigation/SiteNav.tsx";
import { RouteProgress } from "../components/progress/RouteProgress.tsx";
import { ScrollProgress } from "../components/progress/ScrollProgress.tsx";
import { SpotlightSearch } from "../components/search/SpotlightSearch.tsx";

export function RootLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const reduce = useReducedMotion();
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [location.pathname]);

  useEffect(() => {
    const node = headerRef.current;
    if (!node) return;
    const sync = () => {
      document.documentElement.style.setProperty("--tariq-header-h", `${node.offsetHeight}px`);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-svh flex-col overflow-x-hidden bg-surface theme-ease">
      <RouteProgress />
      <ScrollProgress />
      <div ref={headerRef} className="fixed inset-x-0 top-0 z-50">
        <AnnouncementBar />
        <SiteNav sticky={false} />
      </div>
      <SpotlightSearch />
      <main
        id="main"
        tabIndex={-1}
        className="flex-1 overflow-x-hidden pb-24 outline-none md:pb-0"
        style={{ paddingTop: "var(--tariq-header-h, 5.5rem)" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: reduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-x-hidden"
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
