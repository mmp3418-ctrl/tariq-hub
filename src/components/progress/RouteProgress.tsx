import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function RouteProgress() {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const length = useMotionValue(0);
  const opacity = useMotionValue(0);
  const tip = useTransform(length, (value) => `${(1 - value) * 100}%`);
  const drawn = useRef<string | null>(null);

  useEffect(() => {
    if (drawn.current === null) {
      drawn.current = pathname;
      return;
    }
    if (drawn.current === pathname) return;

    let cancelled = false;
    const running: Array<{ stop: () => void }> = [];

    const play = (value: number, duration: number) => {
      const controls = animate(length, value, { duration, ease });
      running.push(controls);
      return controls;
    };

    opacity.set(1);
    length.set(0);

    void (async () => {
      try {
        if (reduce) {
          length.set(1);
        } else {
          await play(0.64, 0.4);
          if (cancelled) return;
          await play(1, 0.3);
        }
        if (cancelled) return;
        const fade = animate(opacity, 0, { duration: reduce ? 0.01 : 0.26, delay: 0.05 });
        running.push(fade);
        await fade;
        if (!cancelled) drawn.current = pathname;
      } catch {
        // A newer navigation stops the draw mid-stroke.
      }
    })();

    return () => {
      cancelled = true;
      opacity.set(0);
      for (const controls of running) controls.stop();
    };
  }, [pathname, length, opacity, reduce]);

  return (
    <motion.div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-3" style={{ opacity }}>
      <svg viewBox="0 0 1000 8" preserveAspectRatio="none" className="block h-[3px] w-full overflow-visible">
        <defs>
          <linearGradient id="tariq-route" x1="1000" y1="0" x2="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#059669" />
            <stop offset="0.55" stopColor="#10B981" />
            <stop offset="1" stopColor="#A7F3D0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M1000 4 H0"
          fill="none"
          stroke="#10B981"
          strokeWidth="8"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: length, opacity: 0.35 }}
        />
        <motion.path
          d="M1000 4 H0"
          fill="none"
          stroke="url(#tariq-route)"
          strokeWidth="2.5"
          strokeLinecap="butt"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: length }}
        />
      </svg>
      <motion.span
        className="absolute top-[3px] size-[7px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-emerald shadow-[0_0_16px_rgba(16,185,129,0.9)]"
        style={{ left: tip }}
      />
    </motion.div>
  );
}
