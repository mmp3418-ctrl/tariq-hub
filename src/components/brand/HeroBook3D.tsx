import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { usePreferences } from "../../lib/preferences.tsx";
import { Mark } from "./Mark.tsx";

const TILT = 14;
const REST_Y = -22;
const REST_X = 8;
const SPRING = { stiffness: 170, damping: 22, mass: 0.55 };
const COVER_SPRING = { stiffness: 120, damping: 18, mass: 0.7 };

type HeroBook3DProps = {
  className?: string;
};

export function HeroBook3D({ className = "" }: HeroBook3DProps) {
  const reduce = useReducedMotion();
  const { t } = usePreferences();
  const sceneRef = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isOpen = opened || hovered;

  const rawX = useMotionValue(REST_Y);
  const rawY = useMotionValue(REST_X);
  const rotateY = useSpring(rawX, SPRING);
  const rotateX = useSpring(rawY, SPRING);
  const transform = useMotionTemplate`rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  const coverRaw = useMotionValue(0);
  const coverAngle = useSpring(coverRaw, COVER_SPRING);
  const coverTransform = useMotionTemplate`translateZ(16px) rotateY(${coverAngle}deg)`;

  const glareX = useTransform(rotateY, [REST_Y - TILT, REST_Y + TILT], [22, 78]);
  const glareY = useTransform(rotateX, [REST_X + TILT, REST_X - TILT], [18, 72]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.48) 0%, transparent 52%)`;

  useEffect(() => {
    rawX.set(REST_Y);
    rawY.set(REST_X);
  }, [rawX, rawY]);

  useEffect(() => {
    coverRaw.set(isOpen ? (reduce ? -110 : -132) : 0);
  }, [coverRaw, isOpen, reduce]);

  const onMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (reduce || !sceneRef.current) return;
      const rect = sceneRef.current.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      rawX.set(REST_Y + (px - 0.5) * TILT * 2);
      rawY.set(REST_X + (0.5 - py) * TILT * 1.2);
    },
    [rawX, rawY, reduce],
  );

  const onLeave = useCallback(() => {
    rawX.set(REST_Y);
    rawY.set(REST_X);
    setHovered(false);
  }, [rawX, rawY]);

  return (
    <div
      ref={sceneRef}
      className={`hero-book-scene relative mx-auto flex w-full max-w-[220px] items-center justify-center sm:max-w-[300px] lg:max-w-none ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onPointerEnter={() => {
        if (!reduce && window.matchMedia("(hover: hover)").matches) setHovered(true);
      }}
    >
      <div className="pointer-events-none absolute inset-x-[10%] bottom-[2%] h-[18%] rounded-[50%] bg-emerald/35 blur-3xl" />

      <motion.button
        type="button"
        aria-label={isOpen ? t("closeBook") : t("openBook")}
        aria-pressed={opened}
        className="hero-book-float relative aspect-[3/4] w-[min(100%,200px)] cursor-pointer border-0 bg-transparent p-0 sm:w-[250px] lg:w-[280px]"
        initial={reduce ? false : { opacity: 0, y: 24, scale: 0.94 }}
        animate={
          reduce
            ? { opacity: 1, y: 0 }
            : {
                opacity: 1,
                y: [0, -14, 0],
                rotateZ: [-6, -4, -6],
              }
        }
        transition={
          reduce
            ? { duration: 0.35 }
            : {
                opacity: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                scale: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                y: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
                rotateZ: { duration: 5.6, repeat: Infinity, ease: "easeInOut" },
              }
        }
        onClick={() => setOpened((value) => !value)}
      >
        <motion.div className="hero-book relative size-full" style={{ transform }}>
          {/* Fixed page block (inside) */}
          <div className="hero-book-face absolute inset-0 overflow-hidden rounded-[12px] border border-slate-200/80 bg-[#F8FAFC] shadow-[0_28px_60px_-22px_rgba(0,0,0,0.55)]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#F1F5F9_100%)]" />
            <div className="absolute start-0 top-0 h-full w-2.5 bg-[linear-gradient(90deg,#CBD5E1,#E2E8F0)]" />
            <div className="relative z-10 flex h-full flex-col gap-3 p-4 sm:p-5" dir="rtl">
              <p className="font-display text-[10px] font-semibold tracking-[0.2em] text-emerald">منصة طارق</p>
              <p className="text-sm font-bold leading-6 text-slate-900">مسار الدراسة الليبي</p>
              <ul className="space-y-2 text-[11px] leading-5 text-slate-600">
                <li className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5">① اختر المرحلة والصف</li>
                <li className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5">② عاين الملخصات PDF</li>
                <li className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5">③ شاهد الشروحات المرئية</li>
              </ul>
              <div className="mt-auto rounded-lg border border-emerald/25 bg-emerald/10 px-2.5 py-2">
                <p className="text-[10px] font-semibold text-teal">Notes · Grades · Playlists</p>
                <p className="mt-1 text-[10px] leading-4 text-slate-500">Preview page · صفحة معاينة</p>
              </div>
            </div>
          </div>

          {/* Opening cover (hinged at spine) */}
          <motion.div
            className="hero-book-face hero-book-cover absolute inset-0 overflow-hidden rounded-[12px] border border-white/25 shadow-[0_24px_50px_-18px_rgba(0,0,0,0.65)]"
            style={{
              transform: coverTransform,
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Outside cover */}
            <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
              <div className="absolute inset-0 bg-[linear-gradient(145deg,#10B981_0%,#059669_48%,#047857_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.34),transparent_42%),linear-gradient(180deg,transparent_52%,rgba(11,19,43,0.35)_100%)]" />
              <motion.div className="absolute inset-0 mix-blend-soft-light" style={{ backgroundImage: glare }} />
              <div className="absolute start-0 top-0 h-full w-3 bg-[linear-gradient(90deg,rgba(11,19,43,0.55),rgba(11,19,43,0.05))]" />
              <div className="absolute inset-x-4 top-4 h-px bg-gradient-to-r from-transparent via-[#F8E7A1]/80 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

              <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-6">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-lg bg-navy/85 p-1.5 ring-1 ring-white/25">
                    <Mark />
                  </span>
                  <span className="font-display text-[10px] font-semibold tracking-[0.2em] text-[#F8E7A1]/95">
                    LIBYA · CURRICULUM
                  </span>
                </div>

                <div>
                  <p className="font-display text-[11px] font-semibold tracking-[0.22em] text-[#F8E7A1]">TARIQ PLATFORM</p>
                  <p
                    className="mt-2 font-sans text-3xl font-extrabold leading-none text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] sm:text-4xl"
                    dir="rtl"
                    style={{ textShadow: "0 1px 0 rgba(248,231,161,0.35)" }}
                  >
                    منصة طارق
                  </p>
                  <p className="mt-3 max-w-[12rem] text-xs leading-5 text-white/90">Notes · Grades · Playlists</p>
                </div>

                <div className="flex items-end justify-between gap-3">
                  <span className="rounded-md bg-navy/75 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-[#F8E7A1] ring-1 ring-white/15">
                    2025–26
                  </span>
                  <span className="size-8 rounded-full border border-[#F8E7A1]/45 bg-white/10 shadow-[inset_0_0_12px_rgba(248,231,161,0.25)]" />
                </div>
              </div>
            </div>

            {/* Inside cover */}
            <div
              className="absolute inset-0 rounded-[12px] bg-[linear-gradient(160deg,#0F172A_0%,#0B132B_100%)] p-4"
              style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
            >
              <div className="flex h-full flex-col justify-between rounded-lg border border-emerald/25 p-3">
                <p className="font-display text-[10px] tracking-[0.24em] text-emerald">INSIDE</p>
                <p className="text-sm font-bold text-white" dir="rtl">
                  ابدأ من صفّك
                </p>
                <p className="text-[11px] leading-5 text-white/70">Stage → Grade → Notes & Playlists</p>
              </div>
            </div>
          </motion.div>

          {/* Spine */}
          <div className="hero-book-face hero-book-spine absolute top-0 h-full w-7 rounded-s-md bg-[linear-gradient(180deg,#0F172A_0%,#0B132B_50%,#102A43_100%)] shadow-inner">
            <div className="flex h-full items-center justify-center px-0.5">
              <span className="font-display text-[8px] font-semibold tracking-[0.28em] text-emerald [writing-mode:vertical-rl]">
                منصة طارق
              </span>
            </div>
          </div>

          {/* Page thickness edge */}
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

          <div className="hero-book-face hero-book-top absolute start-[2%] top-0 h-7 w-[96%] bg-[linear-gradient(180deg,#CBD5E1,#F8FAFC)]" />
        </motion.div>
      </motion.button>
    </div>
  );
}
