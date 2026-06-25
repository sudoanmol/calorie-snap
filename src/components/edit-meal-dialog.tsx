"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Meal } from "@/lib/meals";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function EditMealDialog({
  meal,
  open,
  onOpenChange,
}: {
  meal: Meal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateMeal = useMutation(api.meals.updateMeal);
  const [form, setForm] = useState({
    name: meal.name,
    mealType: meal.mealType,
    calories: String(meal.calories),
    protein: String(meal.protein),
    carbs: String(meal.carbs),
    fat: String(meal.fat),
  });

  async function save() {
    await updateMeal({
      id: meal._id,
      name: form.name.trim() || meal.name,
      mealType: form.mealType.trim() || meal.mealType,
      description: meal.description,
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
      date: meal.date,
    });
    toast.success("Meal updated");
    onOpenChange(false);
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>Edit meal</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...field("name")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mealType">Meal type</Label>
            <Input id="mealType" {...field("mealType")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="calories">Calories</Label>
              <Input id="calories" type="number" inputMode="numeric" {...field("calories")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input id="protein" type="number" inputMode="numeric" {...field("protein")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input id="carbs" type="number" inputMode="numeric" {...field("carbs")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fat">Fat (g)</Label>
              <Input id="fat" type="number" inputMode="numeric" {...field("fat")} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
