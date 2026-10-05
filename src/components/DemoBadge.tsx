export function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded border border-amber-300/80 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800 ${className}`}
    >
      Demo
    </span>
  );
}
