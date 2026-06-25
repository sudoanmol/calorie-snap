"use client";

import { cn } from "@/lib/utils";

type RingProps = {
  value: number;
  goal: number;
  size?: number;
  stroke?: number;
  color: string;
  trackColor?: string;
  className?: string;
  children?: React.ReactNode;
};

/** A single circular progress ring (Apple-activity style). */
export function Ring({
  value,
  goal,
  size = 160,
  stroke = 14,
  color,
  trackColor = "rgba(255,255,255,0.08)",
  className,
  children,
}: RingProps) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = goal > 0 ? Math.min(value / goal, 1) : 0;
  const dash = circumference * pct;

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 grid place-items-center text-center">
          {children}
        </div>
      )}
    </div>
  );
}
