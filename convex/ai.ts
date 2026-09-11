"use node";

import { v } from "convex/values";
import { createGateway, generateObject, generateText } from "ai";
import { z } from "zod";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

const MODEL = "google/gemini-3.8-flash";
const IMAGE_MODEL = "google/gemini-3.1-flash-lite-image";

const MEAL_TYPES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Morning snack",
  "Afternoon snack",
  "Late night snack",
  "Pre-workout",
  "Post-workout",
] as const;

const analysisSchema = z.object({
  name: z.string(),
  mealType: z.enum(MEAL_TYPES),
  description: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  items: z.array(
    z.object({
      label: z.string(),
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
    }),
  ),
});

const SYSTEM_PROMPT = `You are a precise nutrition estimator. Given a photo or text description of a meal, identify the foods and estimate their nutrition.
Rules:
- Always respond with JSON matching the provided schema. No prose.
- "name": a short, appetizing human label for the whole meal (max ~6 words). Always name it yourself.
- "mealType": classify based on the provided local time of day and the user's workout time. Use exactly one of: "Breakfast", "Lunch", "Dinner", "Morning snack", "Afternoon snack", "Late night snack", "Pre-workout", "Post-workout". If the meal is within ~90 min before the workout time use "Pre-workout"; within ~90 min after, "Post-workout"; otherwise pick by time of day.
- "description": one concise sentence describing what was eaten and rough portions.
- Macros ("protein", "carbs", "fat") are in GRAMS. "calories" in kcal.
- Break the meal into "items" (one per distinct food or drink). Always include this array, even for a single food. Each item needs its own label, calories, and macros. The top-level calories/macros MUST equal the sum of the items.
- Give realistic best-effort estimates for typical portion sizes when unsure. Never refuse.`;

function aiGateway() {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    throw new Error(
      "AI_GATEWAY_API_KEY is not set. Run: npx convex env set AI_GATEWAY_API_KEY <key>",
    );
  }
  return createGateway({ apiKey });
}

async function analyzeMeal({
  text,
  image,
}: {
  text: string;
  image?: { bytes: Uint8Array; mediaType: string };
}) {
  const { object } = await generateObject({
    model: aiGateway()(MODEL),
    schema: analysisSchema,
    schemaName: "meal_analysis",
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: image
          ? [
              { type: "text" as const, text },
              {
                type: "image" as const,
                image: image.bytes,
                mediaType: image.mediaType,
              },
            ]
          : text,
      },
    ],
  });
  return object;
}

function contextLine(localTime: string, workoutTime?: string): string {
  const workout = workoutTime
    ? ` The user's usual workout time is ${workoutTime}.`
    : "";
  return `Local time this meal was eaten: ${localTime}.${workout}`;
}

export const analyzeImage = action({
  args: {
    storageId: v.id("_storage"),
    date: v.string(),
    localTime: v.string(),
    workoutTime: v.optional(v.string()),
    userNote: v.optional(v.string()),
  },
  handler: async (ctx, { storageId, date, localTime, workoutTime, userNote }) => {
    const blob = await ctx.storage.get(storageId);
    if (!blob) throw new Error("Image not found in storage");

    const bytes = new Uint8Array(await blob.arrayBuffer());
    const note = userNote?.trim();
    const noteLine = note
      ? ` The user also wrote: ${note}. Use the photo as the primary source and the note for portions, ingredients, or details that are hard to see.`
      : "";
    const analysis = await analyzeMeal({
      text: `Estimate the calories and macros for this meal. ${contextLine(localTime, workoutTime)}${noteLine}`,
      image: { bytes, mediaType: blob.type || "image/jpeg" },
    });

    await ctx.runMutation(internal.meals.insertMeal, {
      ...analysis,
      imageStorageId: storageId,
      date,
      source: "photo",
      createdAt: Date.now(),
    });

    return analysis;
  },
});

export const analyzeText = action({
  args: {
    text: v.string(),
    date: v.string(),
    localTime: v.string(),
    workoutTime: v.optional(v.string()),
  },
  handler: async (ctx, { text, date, localTime, workoutTime }) => {
    const analysis = await analyzeMeal({
      text: `Meal description: ${text}\n${contextLine(localTime, workoutTime)}`,
    });

    const mealId = await ctx.runMutation(internal.meals.insertMeal, {
      ...analysis,
      date,
      source: "chat",
      createdAt: Date.now(),
    });

    // Generate a thumbnail in the background so the meal logs instantly and the
    // image fills in when ready (Nano Banana 2).
    await ctx.scheduler.runAfter(0, internal.ai.generateMealImage, {
      mealId,
      prompt: `${analysis.name}. ${analysis.description}`,
    });

    return analysis;
  },
});

/** Generates an appetizing food photo for a chat-logged meal and attaches it. */
export const generateMealImage = internalAction({
  args: { mealId: v.id("meals"), prompt: v.string() },
  handler: async (ctx, { mealId, prompt }) => {
    try {
      const result = await generateText({
        model: aiGateway()(IMAGE_MODEL),
        prompt: `A realistic, appetizing top-down food photograph of: ${prompt}. Nicely plated on a clean surface, natural soft lighting, shallow depth of field, no text, no people.`,
      });

      const file = result.files.find((f) => f.mediaType.startsWith("image/"));
      if (!file) return;

      const bytes = Uint8Array.from(file.uint8Array);
      const blob = new Blob([bytes], { type: file.mediaType });
      const storageId = await ctx.storage.store(blob);
      await ctx.runMutation(internal.meals.setMealImage, {
        id: mealId,
        storageId,
      });
    } catch {
      // Thumbnail is best-effort; the meal is already logged without it.
    }
  },
});
