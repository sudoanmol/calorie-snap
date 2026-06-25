import { format, isToday, isYesterday, parseISO } from "date-fns";
import type { FunctionReturnType } from "convex/server";
import type { api } from "../../convex/_generated/api";

export type Meal = FunctionReturnType<typeof api.meals.listMeals>[number];

/** Local-day key "YYYY-MM-DD" for the given date (defaults to now). */
export function dayKey(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

/** Human label for a day key, relative to today. */
export function dayLabel(key: string): string {
  const d = parseISO(key);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEE, MMM d");
}

export function fullDayLabel(key: string): string {
  return format(parseISO(key), "EEEE, MMMM d, yyyy");
}

export type Totals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export function sumTotals(meals: Meal[]): Totals {
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

/** Macro split as percentages of total macro grams (for the split bar). */
export function macroSplit(t: Totals) {
  const total = t.protein + t.carbs + t.fat || 1;
  return {
    protein: (t.protein / total) * 100,
    carbs: (t.carbs / total) * 100,
    fat: (t.fat / total) * 100,
  };
}

export const round = (n: number) => Math.round(n);
