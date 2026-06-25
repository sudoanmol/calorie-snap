import type { FunctionReturnType } from "convex/server";
import type { api } from "../../convex/_generated/api";

export type Settings = NonNullable<FunctionReturnType<typeof api.settings.getSettings>>;

export type Sex = "male" | "female";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type Goal = "cut" | "maintain" | "recomp" | "bulk";

export const GOAL_OPTIONS: {
  value: Goal;
  label: string;
  hint: string;
  calorieFactor: number;
  proteinPerKg: number;
}[] = [
  { value: "cut", label: "Cut", hint: "Lose fat", calorieFactor: 0.8, proteinPerKg: 2.2 },
  { value: "maintain", label: "Maintain", hint: "Stay the same", calorieFactor: 1.0, proteinPerKg: 1.8 },
  { value: "recomp", label: "Recomp", hint: "Lean gains", calorieFactor: 1.0, proteinPerKg: 2.2 },
  { value: "bulk", label: "Bulk", hint: "Build muscle", calorieFactor: 1.1, proteinPerKg: 1.8 },
];

export const ACTIVITY_OPTIONS: {
  value: ActivityLevel;
  label: string;
  factor: number;
  hint: string;
}[] = [
  { value: "sedentary", label: "Sedentary", factor: 1.2, hint: "Little/no exercise" },
  { value: "light", label: "Light", factor: 1.375, hint: "1–3 days/week" },
  { value: "moderate", label: "Moderate", factor: 1.55, hint: "3–5 days/week" },
  { value: "active", label: "Active", factor: 1.725, hint: "6–7 days/week" },
  { value: "very_active", label: "Very active", factor: 1.9, hint: "Hard daily / physical job" },
];

export type Targets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

/** Sensible fallback before the user sets up a profile. */
export const FALLBACK_TARGETS: Targets = {
  calories: 2000,
  protein: 150,
  carbs: 220,
  fat: 65,
};

export const DEFAULT_PROFILE = {
  heightCm: 175,
  weightKg: 75,
  age: 28,
  sex: "male" as Sex,
  activityLevel: "moderate" as ActivityLevel,
  goal: "maintain" as Goal,
};

/** Mifflin-St Jeor TDEE, adjusted by goal → macro targets. */
export function computeTdeeTargets(p: {
  heightCm: number;
  weightKg: number;
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  goal: Goal;
}): Targets {
  const s = p.sex === "male" ? 5 : -161;
  const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + s;
  const factor =
    ACTIVITY_OPTIONS.find((a) => a.value === p.activityLevel)?.factor ?? 1.55;
  const tdee = bmr * factor;

  const goal = GOAL_OPTIONS.find((g) => g.value === p.goal) ?? GOAL_OPTIONS[1];
  const calories = Math.round(tdee * goal.calorieFactor);

  const protein = Math.round(goal.proteinPerKg * p.weightKg);
  const fat = Math.round((calories * 0.25) / 9); // 25% of calories
  const carbs = Math.max(
    0,
    Math.round((calories - protein * 4 - fat * 9) / 4),
  );

  return { calories, protein, carbs, fat };
}

/** Final targets = TDEE-derived, with any manual overrides applied. */
export function resolveTargets(settings: Settings | null | undefined): Targets {
  if (!settings) return FALLBACK_TARGETS;
  const base = computeTdeeTargets({ ...settings, goal: settings.goal ?? "maintain" });
  return {
    calories: settings.calorieOverride ?? base.calories,
    protein: settings.proteinOverride ?? base.protein,
    carbs: settings.carbsOverride ?? base.carbs,
    fat: settings.fatOverride ?? base.fat,
  };
}
