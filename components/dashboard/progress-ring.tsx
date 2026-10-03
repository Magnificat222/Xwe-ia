export function ProgressRing({ percent }: { percent: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width="104" height="104" viewBox="0 0 104 104" className="-rotate-90">
      <circle
        cx="52"
        cy="52"
        r={radius}
        fill="none"
        stroke="var(--color-ivoire)"
        strokeOpacity={0.1}
        strokeWidth="8"
      />
      <circle
        cx="52"
        cy="52"
        r={radius}
        fill="none"
        stroke="var(--color-or)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
      <text
        x="52"
        y="52"
        textAnchor="middle"
        dominantBaseline="middle"
        className="rotate-90"
        fill="var(--color-ivoire)"
        fontSize="20"
        fontFamily="var(--font-display)"
        transform="rotate(90 52 52)"
      >
        {percent}%
      </text>
    </svg>
  );
}
