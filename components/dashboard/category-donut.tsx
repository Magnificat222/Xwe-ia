interface Segment {
  label: string;
  value: number;
  color: string;
}

export function CategoryDonut({ segments, centerLabel, centerValue }: {
  segments: Segment[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative shrink-0">
        <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
          <circle cx="75" cy="75" r={radius} fill="none" stroke="currentColor" className="text-ivoire/8" strokeWidth="14" />
          {total > 0 &&
            segments.map((s) => {
              if (s.value === 0) return null;
              const fraction = s.value / total;
              const dash = fraction * circumference;
              const offset = cumulative;
              cumulative += dash;
              return (
                <circle
                  key={s.label}
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="14"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              );
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-display text-2xl text-ivoire">{centerValue}</p>
          <p className="text-[11px] text-ivoire-dim">{centerLabel}</p>
        </div>
      </div>

      <div className="w-full space-y-2.5">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="flex-1 truncate text-sm text-ivoire-dim">{s.label}</span>
            <span className="text-sm font-medium text-ivoire">{s.value}</span>
          </div>
        ))}
        {total === 0 && (
          <p className="text-sm text-ivoire-dim">Terminez une mission pour voir votre répartition ici.</p>
        )}
      </div>
    </div>
  );
}
