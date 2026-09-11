"use client";

import { UtensilsCrossed } from "lucide-react";
import { Meal } from "@/lib/meals";
import { MealCard } from "./meal-card";

export function DayLog({ meals }: { meals: Meal[] }) {
  if (meals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
        <UtensilsCrossed className="size-10 opacity-40" />
        <p className="text-sm">No meals logged for this day.</p>
        <p className="text-xs">Tap Capture or Manual below to add one.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {meals.map((meal, i) => (
        <MealCard key={meal._id} meal={meal} eager={i === 0} />
      ))}
    </div>
  );
}
