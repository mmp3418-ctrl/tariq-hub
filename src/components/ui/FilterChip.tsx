export function FilterChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`theme-ease rounded-full px-3.5 py-1.5 text-sm font-semibold ${
        active
          ? "brand-gradient text-white shadow-[0_10px_30px_-12px_rgba(16,185,129,0.9)]"
          : "glass text-muted hover:text-fg"
      }`}
    >
      {label}
    </button>
  );
}
