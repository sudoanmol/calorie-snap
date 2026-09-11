import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Returns the single settings/profile row, or null if not set up yet. */
export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query("settings").first();
    if (!row) return null;
    const { _id, _creationTime, ...rest } = row;
    void _id;
    void _creationTime;
    return rest;
  },
});

export const updateSettings = mutation({
  args: {
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
    goal: v.union(
      v.literal("cut"),
      v.literal("maintain"),
      v.literal("recomp"),
      v.literal("bulk"),
    ),
    workoutTime: v.optional(v.string()),
    calorieOverride: v.optional(v.number()),
    proteinOverride: v.optional(v.number()),
    carbsOverride: v.optional(v.number()),
    fatOverride: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("settings").first();
    if (existing) {
      await ctx.db.replace(existing._id, args);
    } else {
      await ctx.db.insert("settings", args);
    }
  },
});
