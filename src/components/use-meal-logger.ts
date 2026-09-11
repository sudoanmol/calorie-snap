"use client";

import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { api } from "../../convex/_generated/api";
import { dayKey } from "@/lib/meals";
import { toast } from "sonner";

/** Shared logic for logging a meal from a photo file or a text description. */
export function useMealLogger() {
  const generateUploadUrl = useMutation(api.meals.generateUploadUrl);
  const analyzeImage = useAction(api.ai.analyzeImage);
  const analyzeText = useAction(api.ai.analyzeText);
  const settings = useQuery(api.settings.getSettings);
  const [pending, setPending] = useState(false);

  const now = () => ({
    date: dayKey(),
    localTime: format(new Date(), "EEEE h:mm a"),
    workoutTime: settings?.workoutTime || undefined,
  });

  async function logPhoto(file: Blob, userNote?: string) {
    setPending(true);
    const t = toast.loading("Analyzing your meal…");
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "image/jpeg" },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = await res.json();
      const note = userNote?.trim();
      const meal = await analyzeImage({
        storageId,
        ...now(),
        userNote: note || undefined,
      });
      toast.success(`Logged ${meal.name} · ${Math.round(meal.calories)} kcal`, {
        id: t,
      });
      return meal;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to log meal", { id: t });
      throw e;
    } finally {
      setPending(false);
    }
  }

  async function logText(text: string) {
    setPending(true);
    const t = toast.loading("Analyzing your meal…");
    try {
      const meal = await analyzeText({ text, ...now() });
      toast.success(`Logged ${meal.name} · ${Math.round(meal.calories)} kcal`, {
        id: t,
      });
      return meal;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to log meal", { id: t });
      throw e;
    } finally {
      setPending(false);
    }
  }

  return { logPhoto, logText, pending };
}
