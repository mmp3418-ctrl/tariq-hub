import {
  useCallback,
  useRef,
  type CSSProperties,
  type ElementType,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

export function SpotlightCard({ children, className = "", as: Tag = "div" }: SpotlightCardProps) {
  const ref = useRef<HTMLElement | null>(null);

  const onMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    node.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
    node.dataset.spot = "1";
  }, []);

  const onLeave = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.dataset.spot = "0";
  }, []);

  return (
    <Tag
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`spotlight-card group relative overflow-hidden ${className}`}
      style={{ "--spot-x": "40%", "--spot-y": "20%" } as CSSProperties}
    >
      <span
        aria-hidden="true"
        className="spotlight-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(240px circle at var(--spot-x) var(--spot-y), rgba(16,185,129,0.18), transparent 60%), linear-gradient(90deg, rgba(16,185,129,0.08), transparent 55%)",
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </Tag>
  );
}
