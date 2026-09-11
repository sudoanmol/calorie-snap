"use client";

import Image from "next/image";
import { format } from "date-fns";
import { Camera, MessageSquareText, X } from "lucide-react";
import { Meal, round } from "@/lib/meals";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function MacroCell({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-base font-semibold tabular-nums ${className}`}>
        {round(value)}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function MealDetailDialog({
  meal,
  open,
  onOpenChange,
}: {
  meal: Meal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const items = meal.items ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!meal.imageUrl}
        className="fixed bottom-0 left-1/2 top-auto max-h-[85dvh] w-full max-w-md -translate-x-1/2 translate-y-0 gap-0 overflow-y-auto rounded-b-none rounded-t-2xl p-0 data-open:slide-in-from-bottom-4 sm:max-w-md"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {meal.imageUrl ? (
          <div className="relative">
            <Image
              src={meal.imageUrl}
              alt={meal.name}
              width={448}
              height={176}
              className="h-44 w-full object-cover"
              unoptimized
            />
            <DialogClose
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-2 right-2 bg-black/45 text-white hover:bg-black/60 hover:text-white"
                />
              }
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 p-4">
          <DialogHeader className="gap-1.5">
            <div className="flex items-center gap-1.5 pr-8 text-xs text-muted-foreground">
              <Badge
                variant="secondary"
                className="rounded-full px-2 py-0 text-[10px]"
              >
                {meal.mealType}
              </Badge>
              <span className="inline-flex items-center gap-0.5">
                {meal.source === "photo" ? (
                  <Camera className="size-3" />
                ) : (
                  <MessageSquareText className="size-3" />
                )}
                {format(meal.createdAt, "h:mm a")}
              </span>
            </div>
            <DialogTitle className="text-lg leading-snug">
              {meal.name}
            </DialogTitle>
            <DialogDescription>{meal.description}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-4 rounded-xl bg-muted/60 px-2 py-3">
            <MacroCell
              value={meal.calories}
              label="kcal"
              className="text-orange-400"
            />
            <MacroCell
              value={meal.protein}
              label="protein"
              className="text-cyan-400"
            />
            <MacroCell
              value={meal.carbs}
              label="carbs"
              className="text-violet-400"
            />
            <MacroCell
              value={meal.fat}
              label="fat"
              className="text-pink-400"
            />
          </div>

          {items.length > 0 ? (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Items
              </p>
              <ul className="divide-y divide-border">
                {items.map((item, i) => (
                  <li
                    key={`${item.label}-${i}`}
                    className="flex items-baseline justify-between gap-3 py-2.5 text-sm"
                  >
                    <span className="min-w-0 wrap-break-word">{item.label}</span>
                    <span className="shrink-0 font-medium tabular-nums text-orange-400">
                      {round(item.calories)} kcal
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
