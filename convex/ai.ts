"use node";

import { v } from "convex/values";
import { OpenRouter } from "@openrouter/sdk";
import { getAuthUserId } from "@convex-dev/auth/server";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const MODEL = "google/gemini-3.5-flash";
// Nano Banana 2 — used to generate a thumbnail for chat-logged meals.
const IMAGE_MODEL = "google/gemini-3.1-flash-image-preview";

const SYSTEM_PROMPT = `You are a precise nutrition estimator. Given a photo or text description of a meal, identify the foods and estimate their nutrition.
Rules:
- Always respond with JSON matching the provided schema. No prose.
- "name": a short, appetizing human label for the whole meal (max ~6 words). Always name it yourself.
- "mealType": classify based on the provided local time of day and the user's workout time. Use exactly one of: "Breakfast", "Lunch", "Dinner", "Morning snack", "Afternoon snack", "Late night snack", "Pre-workout", "Post-workout". If the meal is within ~90 min before the workout time use "Pre-workout"; within ~90 min after, "Post-workout"; otherwise pick by time of day.
- "description": one concise sentence describing what was eaten and rough portions.
- Macros ("protein", "carbs", "fat") are in GRAMS. "calories" in kcal.
- Break the meal into "items" (one per distinct food). The top-level calories/macros MUST equal the sum of the items.
- Give realistic best-effort estimates for typical portion sizes when unsure. Never refuse.`;

// JSON schema OpenRouter enforces on the model's reply.
const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: "string" },
    mealType: { type: "string" },
    description: { type: "string" },
    calories: { type: "number" },
    protein: { type: "number" },
    carbs: { type: "number" },
    fat: { type: "number" },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          calories: { type: "number" },
          protein: { type: "number" },
          carbs: { type: "number" },
          fat: { type: "number" },
        },
        required: ["label", "calories", "protein", "carbs", "fat"],
      },
    },
  },
  required: [
    "name",
    "mealType",
    "description",
    "calories",
    "protein",
    "carbs",
    "fat",
    "items",
  ],
} as const;

type Analysis = {
  name: string;
  mealType: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: {
    label: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
};

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; imageUrl: { url: string } };

function client() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Run: npx convex env set OPENROUTER_API_KEY <key>",
    );
  }
  return new OpenRouter({ apiKey });
}

function parseAnalysis(content: unknown): Analysis {
  const raw = typeof content === "string" ? content : "";
  if (!raw) throw new Error("Empty response from model");
  // Strip ```json fences if the model added them, then grab the JSON object.
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const json = start >= 0 && end >= 0 ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(json) as Analysis;
}

async function callModel(userContent: ContentPart[]): Promise<Analysis> {
  const or = client();
  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    { role: "user" as const, content: userContent },
  ];

  try {
    const res = await or.chat.send({
      chatRequest: {
        model: MODEL,
        messages,
        responseFormat: {
          type: "json_schema",
          jsonSchema: {
            name: "meal_analysis",
            strict: true,
            schema: RESPONSE_SCHEMA,
          },
        },
      },
    });
    return parseAnalysis(res.choices[0]?.message?.content);
  } catch {
    // Fallback: some routes don't honor strict json_schema — use json_object.
    const res = await or.chat.send({
      chatRequest: {
        model: MODEL,
        messages,
        responseFormat: { type: "json_object" },
      },
    });
    return parseAnalysis(res.choices[0]?.message?.content);
  }
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
  },
  handler: async (ctx, { storageId, date, localTime, workoutTime }) => {
    if ((await getAuthUserId(ctx)) === null) throw new Error("Not authenticated");
    const blob = await ctx.storage.get(storageId);
    if (!blob) throw new Error("Image not found in storage");

    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mime = blob.type || "image/jpeg";
    const dataUrl = `data:${mime};base64,${base64}`;

    const analysis = await callModel([
      {
        type: "text",
        text: `Estimate the calories and macros for this meal. ${contextLine(localTime, workoutTime)}`,
      },
      { type: "image_url", imageUrl: { url: dataUrl } },
    ]);

    await ctx.runMutation(internal.meals.insertMeal, {
      ...analysis,
      imageStorageId: storageId as Id<"_storage">,
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
    if ((await getAuthUserId(ctx)) === null) throw new Error("Not authenticated");
    const analysis = await callModel([
      {
        type: "text",
        text: `Meal description: ${text}\n${contextLine(localTime, workoutTime)}`,
      },
    ]);

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
      const res = await client().chat.send({
        chatRequest: {
          model: IMAGE_MODEL,
          modalities: ["image", "text"],
          messages: [
            {
              role: "user",
              content: `A realistic, appetizing top-down food photograph of: ${prompt}. Nicely plated on a clean surface, natural soft lighting, shallow depth of field, no text, no people.`,
            },
          ],
        },
      });

      const url = res.choices[0]?.message?.images?.[0]?.imageUrl?.url;
      if (!url) return;

      // `url` is a data URL: data:image/png;base64,XXXX
      const match = /^data:(.+?);base64,(.*)$/.exec(url);
      let blob: Blob;
      if (match) {
        const mime = match[1];
        const bytes = Buffer.from(match[2], "base64");
        blob = new Blob([bytes], { type: mime });
      } else {
        // Fallback: a hosted URL.
        blob = await (await fetch(url)).blob();
      }

      const storageId = await ctx.storage.store(blob);
      await ctx.runMutation(internal.meals.setMealImage, { id: mealId, storageId });
    } catch {
      // Thumbnail is best-effort; the meal is already logged without it.
    }
  },
});
