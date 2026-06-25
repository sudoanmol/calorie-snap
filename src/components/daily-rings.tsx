"use client";

import { Ring } from "./ring";
import { Totals, round } from "@/lib/meals";
import { Targets } from "@/lib/targets";

const COLORS = {
  calories: "#fb923c", // orange
  protein: "#22d3ee", // cyan
  carbs: "#a78bfa", // violet
  fat: "#f472b6", // pink
};

function MacroBar({
  label,
  value,
  goal,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
}) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums">
          <span className="font-medium text-foreground">{round(value)}</span>
          <span className="text-muted-foreground"> / {round(goal)} g</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function DailyRings({
  totals,
  targets,
}: {
  totals: Totals;
  targets: Targets;
}) {
  const calLeft = Math.max(0, round(targets.calories - totals.calories));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-center gap-8">
        <Ring
          value={totals.calories}
          goal={targets.calories}
          color={COLORS.calories}
          size={150}
          stroke={13}
        >
          <div className="flex flex-col items-center leading-none">
            <span className="text-3xl font-semibold tabular-nums">{calLeft}</span>
            <span className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              kcal left
            </span>
            <span className="mt-1 text-[11px] tabular-nums text-muted-foreground">
              {round(totals.calories)} / {round(targets.calories)}
            </span>
          </div>
        </Ring>
        <Ring
          value={totals.protein}
          goal={targets.protein}
          color={COLORS.protein}
          size={150}
          stroke={13}
        >
          <div className="flex flex-col items-center leading-none">
            <span className="text-3xl font-semibold tabular-nums">
              {round(totals.protein)}
            </span>
            <span className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              g protein
            </span>
            <span className="mt-1 text-[11px] tabular-nums text-muted-foreground">
              of {round(targets.protein)}
            </span>
          </div>
        </Ring>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MacroBar
          label="Carbs"
          value={totals.carbs}
          goal={targets.carbs}
          color={COLORS.carbs}
        />
        <MacroBar
          label="Fat"
          value={totals.fat}
          goal={targets.fat}
          color={COLORS.fat}
        />
      </div>
    </div>
  );
}
