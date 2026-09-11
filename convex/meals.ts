import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { macroFields, mealItem } from "./schema";

/** Short-lived URL the client POSTs a photo to (Convex file storage). */
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/** All meals, newest first, with resolved photo URLs. Grouping/totals happen client-side. */
export const listMeals = query({
  args: {},
  handler: async (ctx) => {
    const meals = await ctx.db
      .query("meals")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();

    return Promise.all(
      meals.map(async (meal) => ({
        ...meal,
        imageUrl: meal.imageStorageId
          ? await ctx.storage.getUrl(meal.imageStorageId)
          : null,
      })),
    );
  },
});

/** Internal write used by the analysis actions. */
export const insertMeal = internalMutation({
  args: {
    name: v.string(),
    mealType: v.string(),
    description: v.string(),
    ...macroFields,
    items: v.optional(v.array(mealItem)),
    imageStorageId: v.optional(v.id("_storage")),
    date: v.string(),
    source: v.union(v.literal("photo"), v.literal("chat")),
    createdAt: v.number(),
  },
  returns: v.id("meals"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("meals", args);
  },
});

/** Attach a generated thumbnail to a meal (called by the image-gen action). */
export const setMealImage = internalMutation({
  args: { id: v.id("meals"), storageId: v.id("_storage") },
  handler: async (ctx, { id, storageId }) => {
    const meal = await ctx.db.get(id);
    if (!meal) {
      // Meal was deleted before the image finished — clean up the orphan file.
      await ctx.storage.delete(storageId);
      return;
    }
    await ctx.db.patch(id, { imageStorageId: storageId });
  },
});

export const updateMeal = mutation({
  args: {
    id: v.id("meals"),
    name: v.string(),
    mealType: v.string(),
    description: v.string(),
    ...macroFields,
    date: v.string(),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

export const deleteMeal = mutation({
  args: { id: v.id("meals") },
  handler: async (ctx, { id }) => {
    const meal = await ctx.db.get(id);
    if (!meal) return;
    if (meal.imageStorageId) {
      await ctx.storage.delete(meal.imageStorageId);
    }
    await ctx.db.delete(id);
  },
});
