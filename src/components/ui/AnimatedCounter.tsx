import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export function AnimatedCounter({ value, className = "" }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(motionValue, value, {
      duration: 1.05,
      ease: [0.22, 1, 0.36, 1],
    });
    const unsubscribe = rounded.on("change", (latest) => setDisplay(latest));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [motionValue, reduce, rounded, value]);

  return (
    <motion.span
      key={value}
      initial={reduce ? false : { opacity: 0.5, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      className={className}
    >
      {display}
    </motion.span>
  );
}
