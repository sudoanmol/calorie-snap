"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation } from "convex/react";
import { format } from "date-fns";
import { Camera, MessageSquareText, Pencil, Trash2 } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Meal, round } from "@/lib/meals";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditMealDialog } from "./edit-meal-dialog";
import { toast } from "sonner";

export function MealCard({
  meal,
  eager,
}: {
  meal: Meal;
  eager?: boolean;
}) {
  const deleteMeal = useMutation(api.meals.deleteMeal);
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function remove() {
    await deleteMeal({ id: meal._id });
    setConfirmOpen(false);
    toast.success("Meal deleted");
  }

  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-muted/40 p-3">
      {meal.imageUrl ? (
        <Image
          src={meal.imageUrl}
          alt={meal.name}
          width={72}
          height={72}
          className="size-18 shrink-0 rounded-xl object-cover"
          unoptimized
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
        />
      ) : (
        <div className="grid size-18 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
          <MessageSquareText className="size-6" />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium leading-tight">{meal.name}</p>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px]">
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
          </div>
          <div className="flex shrink-0 gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground"
              onClick={() => setEditing(true)}
              aria-label="Edit meal"
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-red-400"
              onClick={() => setConfirmOpen(true)}
              aria-label="Delete meal"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>

        <div className="mt-auto flex items-center gap-3 text-xs tabular-nums">
          <span className="font-semibold text-orange-400">
            {round(meal.calories)} kcal
          </span>
          <span className="text-cyan-400">{round(meal.protein)}P</span>
          <span className="text-violet-400">{round(meal.carbs)}C</span>
          <span className="text-pink-400">{round(meal.fat)}F</span>
        </div>
      </div>

      {editing && (
        <EditMealDialog meal={meal} open={editing} onOpenChange={setEditing} />
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-xs rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete meal?</AlertDialogTitle>
            <AlertDialogDescription>
              “{meal.name}” will be permanently removed from your log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={remove}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
