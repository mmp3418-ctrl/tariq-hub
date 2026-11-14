export function Folio({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3 text-[0.78rem] text-muted">
      <span className="font-display tracking-[0.22em] text-teal">{index}</span>
      <span>{label}</span>
    </div>
  );
}
