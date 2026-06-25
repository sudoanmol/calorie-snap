"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Segmented } from "@/components/segmented";
import {
  ACTIVITY_OPTIONS,
  ActivityLevel,
  computeTdeeTargets,
  DEFAULT_PROFILE,
  Goal,
  GOAL_OPTIONS,
  Settings,
  Sex,
} from "@/lib/targets";
import { toast } from "sonner";

export function SettingsDialog({
  settings,
  open,
  onOpenChange,
}: {
  settings: Settings | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const save = useMutation(api.settings.updateSettings);

  const init = settings ?? DEFAULT_PROFILE;
  const [profile, setProfile] = useState({
    heightCm: String(init.heightCm),
    weightKg: String(init.weightKg),
    age: String(init.age),
    sex: init.sex as Sex,
    activityLevel: init.activityLevel as ActivityLevel,
    goal: (init.goal ?? DEFAULT_PROFILE.goal) as Goal,
    workoutTime: settings?.workoutTime ?? "",
  });

  const base = useMemo(
    () =>
      computeTdeeTargets({
        heightCm: Number(profile.heightCm) || DEFAULT_PROFILE.heightCm,
        weightKg: Number(profile.weightKg) || DEFAULT_PROFILE.weightKg,
        age: Number(profile.age) || DEFAULT_PROFILE.age,
        sex: profile.sex,
        activityLevel: profile.activityLevel,
        goal: profile.goal,
      }),
    [profile],
  );

  // Override inputs: empty string means "use calculated value".
  const [overrides, setOverrides] = useState({
    calories: settings?.calorieOverride != null ? String(settings.calorieOverride) : "",
    protein: settings?.proteinOverride != null ? String(settings.proteinOverride) : "",
    carbs: settings?.carbsOverride != null ? String(settings.carbsOverride) : "",
    fat: settings?.fatOverride != null ? String(settings.fatOverride) : "",
  });

  // The dialog is always mounted, so re-sync form state from the latest saved
  // settings each time it opens (otherwise it keeps the values captured at first
  // mount, before the query had loaded).
  useEffect(() => {
    if (!open) return;
    const s = settings ?? DEFAULT_PROFILE;
    setProfile({
      heightCm: String(s.heightCm),
      weightKg: String(s.weightKg),
      age: String(s.age),
      sex: s.sex as Sex,
      activityLevel: s.activityLevel as ActivityLevel,
      goal: ((settings?.goal ?? DEFAULT_PROFILE.goal) as Goal),
      workoutTime: settings?.workoutTime ?? "",
    });
    setOverrides({
      calories: settings?.calorieOverride != null ? String(settings.calorieOverride) : "",
      protein: settings?.proteinOverride != null ? String(settings.proteinOverride) : "",
      carbs: settings?.carbsOverride != null ? String(settings.carbsOverride) : "",
      fat: settings?.fatOverride != null ? String(settings.fatOverride) : "",
    });
  }, [open, settings]);

  async function onSave() {
    const num = (s: string) => {
      const n = Number(s);
      return s.trim() !== "" && !Number.isNaN(n) ? n : undefined;
    };
    await save({
      heightCm: Number(profile.heightCm) || DEFAULT_PROFILE.heightCm,
      weightKg: Number(profile.weightKg) || DEFAULT_PROFILE.weightKg,
      age: Number(profile.age) || DEFAULT_PROFILE.age,
      sex: profile.sex,
      activityLevel: profile.activityLevel,
      goal: profile.goal,
      workoutTime: profile.workoutTime.trim() || undefined,
      calorieOverride: num(overrides.calories),
      proteinOverride: num(overrides.protein),
      carbsOverride: num(overrides.carbs),
      fatOverride: num(overrides.fat),
    });
    toast.success("Goals saved");
    onOpenChange(false);
  }

  const targetField = (
    key: keyof typeof overrides,
    label: string,
    unit: string,
  ) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        type="number"
        inputMode="numeric"
        placeholder={`${base[key]} ${unit}`}
        value={overrides[key]}
        onChange={(e) => setOverrides((o) => ({ ...o, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-sm overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Your goals</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Sex */}
          <div className="flex flex-col gap-1.5">
            <Label>Sex</Label>
            <Segmented<Sex>
              value={profile.sex}
              onChange={(sex) => setProfile((p) => ({ ...p, sex }))}
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
              ]}
            />
          </div>

          {/* Body metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                inputMode="numeric"
                value={profile.age}
                onChange={(e) => setProfile((p) => ({ ...p, age: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                inputMode="numeric"
                placeholder="cm"
                value={profile.heightCm}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, heightCm: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                type="number"
                inputMode="numeric"
                placeholder="kg"
                value={profile.weightKg}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, weightKg: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Activity */}
          <div className="flex flex-col gap-1.5">
            <Label>Activity level</Label>
            <Segmented<ActivityLevel>
              columns={1}
              value={profile.activityLevel}
              onChange={(activityLevel) =>
                setProfile((p) => ({ ...p, activityLevel }))
              }
              options={ACTIVITY_OPTIONS.map((a) => ({
                value: a.value,
                label: a.label,
                hint: a.hint,
              }))}
            />
          </div>

          {/* Goal */}
          <div className="flex flex-col gap-1.5">
            <Label>Goal</Label>
            <Segmented<Goal>
              value={profile.goal}
              onChange={(goal) => setProfile((p) => ({ ...p, goal }))}
              options={GOAL_OPTIONS.map((g) => ({
                value: g.value,
                label: g.label,
                hint: g.hint,
              }))}
            />
          </div>

          {/* Workout time */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="workout">Usual workout time (optional)</Label>
            <Input
              id="workout"
              type="time"
              value={profile.workoutTime}
              onChange={(e) =>
                setProfile((p) => ({ ...p, workoutTime: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Used to tag meals as pre / post-workout.
            </p>
          </div>

          {/* Targets */}
          <div className="flex flex-col gap-2 rounded-xl border border-white/8 bg-white/[0.03] p-3">
            <p className="text-sm font-medium">Daily targets</p>
            <p className="text-xs text-muted-foreground">
              Calculated from your profile (TDEE). Leave blank to use the
              calculated value, or type to override.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              {targetField("calories", "Calories", "kcal")}
              {targetField("protein", "Protein", "g")}
              {targetField("carbs", "Carbs", "g")}
              {targetField("fat", "Fat", "g")}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
