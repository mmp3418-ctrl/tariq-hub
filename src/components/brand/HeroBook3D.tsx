import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { Mark } from "./Mark.tsx";

const TILT = 18;
const REST_Y = -28;
const REST_X = 10;
const SPRING = { stiffness: 160, damping: 20, mass: 0.55 };

type HeroBook3DProps = {
  className?: string;
};

export function HeroBook3D({ className = "" }: HeroBook3DProps) {
  const reduce = useReducedMotion();
  const sceneRef = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(REST_Y);
  const rawY = useMotionValue(REST_X);
  const rotateY = useSpring(rawX, SPRING);
  const rotateX = useSpring(rawY, SPRING);
  const transform = useMotionTemplate`rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  const glareX = useTransform(rotateY, [REST_Y - TILT, REST_Y + TILT], [22, 78]);
  const glareY = useTransform(rotateX, [REST_X + TILT, REST_X - TILT], [18, 72]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.5) 0%, transparent 52%)`;

  useEffect(() => {
    rawX.set(REST_Y);
    rawY.set(REST_X);
  }, [rawX, rawY]);

  const onMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (reduce || !sceneRef.current) return;
      const rect = sceneRef.current.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      rawX.set(REST_Y + (px - 0.5) * TILT * 2);
      rawY.set(REST_X + (0.5 - py) * TILT * 1.35);
    },
    [rawX, rawY, reduce],
  );

  const onLeave = useCallback(() => {
    rawX.set(REST_Y);
    rawY.set(REST_X);
  }, [rawX, rawY]);

  return (
    <div
      ref={sceneRef}
      className={`hero-book-scene relative mx-auto flex w-full max-w-[220px] items-center justify-center sm:max-w-[300px] lg:max-w-none ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-x-[8%] bottom-[4%] h-[22%] rounded-[50%] bg-emerald/40 blur-3xl" />

      <motion.div
        className="hero-book-float relative aspect-[3/4] w-[min(100%,200px)] sm:w-[250px] lg:w-[280px]"
        initial={reduce ? false : { opacity: 0, y: 24, scale: 0.94 }}
        animate={
          reduce
            ? { opacity: 1, y: 0 }
            : {
                opacity: 1,
                y: [0, -16, 0],
                rotateZ: [-7, -4.5, -7],
              }
        }
        transition={
          reduce
            ? { duration: 0.35 }
            : {
                opacity: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                scale: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                y: { duration: 4.6, repeat: Infinity, ease: "easeInOut" },
                rotateZ: { duration: 5.4, repeat: Infinity, ease: "easeInOut" },
              }
        }
      >
        <motion.div className="hero-book relative size-full" style={{ transform }}>
          {/* Front cover */}
          <div className="hero-book-face hero-book-cover absolute inset-0 overflow-hidden rounded-[12px] border border-white/20 shadow-[0_32px_64px_-18px_rgba(0,0,0,0.75),0_0_0_1px_rgba(16,185,129,0.25)]">
            <div className="absolute inset-0 bg-[linear-gradient(145deg,#10B981_0%,#059669_45%,#047857_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.32),transparent_40%),linear-gradient(180deg,transparent_50%,rgba(11,19,43,0.38)_100%)]" />
            <motion.div className="absolute inset-0 mix-blend-soft-light" style={{ backgroundImage: glare }} />

            <div className="absolute start-0 top-0 h-full w-3 bg-[linear-gradient(90deg,rgba(11,19,43,0.6),rgba(11,19,43,0.05))]" />
            <div className="absolute inset-x-4 top-4 h-px bg-white/30" />
            <div className="absolute inset-x-4 bottom-4 h-px bg-white/20" />

            <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="rounded-lg bg-navy/85 p-1.5 ring-1 ring-white/25">
                  <Mark />
                </span>
                <span className="font-display text-[10px] font-semibold tracking-[0.2em] text-white/90">
                  LIBYA · CURRICULUM
                </span>
              </div>

              <div>
                <p className="font-display text-[11px] font-semibold tracking-[0.28em] text-white/90">TARIQ HUB</p>
                <p className="mt-2 font-sans text-3xl font-extrabold leading-none text-white sm:text-4xl" dir="rtl">
                  طارق Hub
                </p>
                <p className="mt-3 max-w-[12rem] text-xs leading-5 text-white/85">Notes · Grades · Playlists</p>
              </div>

              <div className="flex items-end justify-between gap-3">
                <span className="rounded-md bg-navy/75 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white ring-1 ring-white/20">
                  2025–26
                </span>
                <span className="size-8 rounded-full border border-white/40 bg-white/15 shadow-[inset_0_0_12px_rgba(255,255,255,0.25)]" />
              </div>
            </div>
          </div>

          {/* Spine */}
          <div className="hero-book-face hero-book-spine absolute top-0 h-full w-7 rounded-s-md bg-[linear-gradient(180deg,#0F172A_0%,#0B132B_50%,#102A43_100%)] shadow-inner">
            <div className="flex h-full items-center justify-center px-0.5">
              <span className="font-display text-[8px] font-semibold tracking-[0.32em] text-emerald [writing-mode:vertical-rl] [text-orientation:mixed]">
                طارق HUB
              </span>
            </div>
          </div>

          {/* Page thickness */}
          <div className="hero-book-face hero-book-pages absolute top-[2.5%] h-[95%] w-6 rounded-e-[2px] bg-[repeating-linear-gradient(90deg,#F8FAFC_0px,#F8FAFC_2px,#E2E8F0_2px,#E2E8F0_3px)]">
            <div className="absolute inset-y-3 end-1 w-px bg-slate-400/50" />
          </div>

          {/* Back cover */}
          <div className="hero-book-face hero-book-back absolute inset-0 rounded-[12px] bg-[linear-gradient(160deg,#0F172A_0%,#0B132B_100%)]">
            <div className="absolute inset-5 rounded-lg border border-emerald/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-xs tracking-[0.34em] text-emerald/85">TARIQ</span>
            </div>
          </div>

          {/* Top edge */}
          <div className="hero-book-face hero-book-top absolute start-[2%] top-0 h-7 w-[96%] bg-[linear-gradient(180deg,#CBD5E1,#F8FAFC)]" />
        </motion.div>
      </motion.div>
    </div>
  );
}
