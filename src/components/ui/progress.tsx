"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { clamp } from "@/lib/utils";

export function Progress({
  value,
  className,
  tone = "or",
  showLabel = false,
  label,
}: {
  value: number;
  className?: string;
  tone?: "or" | "braise" | "feuillage";
  showLabel?: boolean;
  label?: string;
}) {
  const reduce = useReducedMotion();
  const pct = clamp(Math.round(value), 0, 100);

  const fills = {
    or: "linear-gradient(90deg, var(--color-or), var(--color-or-vif))",
    braise: "linear-gradient(90deg, var(--color-braise), var(--color-or))",
    feuillage: "linear-gradient(90deg, var(--color-feuillage), var(--color-feuillage-vif))",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-ivoire-dim">{label ?? "Progression"}</span>
          <span className="font-mono text-or">{pct}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progression"}
        className="h-2 w-full overflow-hidden rounded-full bg-ivoire/8"
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: fills[tone] }}
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

export function ProgressRing({
  value,
  size = 112,
  stroke = 9,
  children,
  tone = "or",
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
  tone?: "or" | "braise" | "feuillage";
}) {
  const reduce = useReducedMotion();
  const pct = clamp(value, 0, 100);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const colors = {
    or: ["var(--color-or)", "var(--color-or-vif)"],
    braise: ["var(--color-braise)", "var(--color-or)"],
    feuillage: ["var(--color-feuillage)", "var(--color-feuillage-vif)"],
  }[tone];

  const gradientId = `ring-${tone}`;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-ivoire/8"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduce ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduce ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
