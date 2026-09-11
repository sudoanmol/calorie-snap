import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const macroFields = {
  calories: v.number(),
  protein: v.number(), // grams
  carbs: v.number(), // grams
  fat: v.number(), // grams
};

export const mealItem = v.object({
  label: v.string(),
  ...macroFields,
});

export default defineSchema({
  meals: defineTable({
    name: v.string(), // short label, e.g. "Chicken burrito bowl"
    mealType: v.string(), // Breakfast | Lunch | Dinner | Afternoon snack | Late night snack | Pre-workout | Post-workout ...
    description: v.string(), // AI/user description of the meal
    ...macroFields,
    items: v.optional(v.array(mealItem)), // per-food breakdown
    imageStorageId: v.optional(v.id("_storage")),
    date: v.string(), // "YYYY-MM-DD" (user-local) for day grouping
    source: v.union(v.literal("photo"), v.literal("chat")),
    createdAt: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_createdAt", ["createdAt"]),

  // Single-user settings/profile (one row). Targets are derived from TDEE,
  // with optional manual overrides.
  settings: defineTable({
    heightCm: v.number(),
    weightKg: v.number(),
    age: v.number(),
    sex: v.union(v.literal("male"), v.literal("female")),
    activityLevel: v.union(
      v.literal("sedentary"),
      v.literal("light"),
      v.literal("moderate"),
      v.literal("active"),
      v.literal("very_active"),
    ),
    // Optional for backward-compat with rows created before goals existed;
    // missing is treated as "maintain".
    goal: v.optional(
      v.union(
        v.literal("cut"),
        v.literal("maintain"),
        v.literal("recomp"),
        v.literal("bulk"),
      ),
    ),
    workoutTime: v.optional(v.string()), // "HH:mm" local, used to tag pre/post-workout meals
    // Optional manual overrides of the TDEE-derived targets.
    calorieOverride: v.optional(v.number()),
    proteinOverride: v.optional(v.number()),
    carbsOverride: v.optional(v.number()),
    fatOverride: v.optional(v.number()),
  }),
});
