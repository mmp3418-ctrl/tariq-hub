import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 28,
    restDelta: 0.001,
  });

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[85] h-[3px] origin-left bg-gradient-to-r from-teal via-emerald to-emerald/40 shadow-[0_0_12px_rgba(16,185,129,0.65)]"
      style={{ scaleX }}
    />
  );
}
