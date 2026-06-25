"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Camera, LogOut, PencilLine, Settings } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { dayKey, sumTotals } from "@/lib/meals";
import { resolveTargets } from "@/lib/targets";
import { DateNav } from "@/components/date-nav";
import { DailyRings } from "@/components/daily-rings";
import { DayLog } from "@/components/day-log";
import { CameraCapture } from "@/components/camera-capture";
import { ManualEntry } from "@/components/manual-entry";
import { SettingsDialog } from "@/components/settings-dialog";

export function Dashboard() {
  const { signOut } = useAuthActions();
  const [day, setDay] = useState(dayKey());
  const [showCamera, setShowCamera] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const meals = useQuery(api.meals.listMeals);
  const settings = useQuery(api.settings.getSettings);

  const dayMeals = useMemo(
    () => (meals ?? []).filter((m) => m.date === day),
    [meals, day],
  );
  const totals = useMemo(() => sumTotals(dayMeals), [dayMeals]);
  const targets = useMemo(() => resolveTargets(settings), [settings]);

  return (
    <div
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col"
      style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-semibold tracking-tight">Calorie Snap</h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground"
            onClick={() => setShowSettings(true)}
            aria-label="Settings"
          >
            <Settings className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground"
            onClick={() => signOut()}
            aria-label="Sign out"
          >
            <LogOut className="size-5" />
          </Button>
        </div>
      </header>

      {/* Rings + date */}
      <section className="flex flex-col gap-5 px-4 pb-4">
        <DailyRings totals={totals} targets={targets} />
        <DateNav day={day} onChange={setDay} />
      </section>

      {settings === null && (
        <Button
          variant="outline"
          onClick={() => setShowSettings(true)}
          className="mx-4 mb-3 h-auto justify-start whitespace-normal border-primary/30 bg-primary/10 px-4 py-2.5 text-left text-sm font-normal"
        >
          👋 Set up your profile to get personalized calorie & macro goals.
        </Button>
      )}

      {/* Day log */}
      <main className="flex-1 overflow-y-auto px-4 pb-40">
        <DayLog meals={dayMeals} />
      </main>

      {/* Bottom action bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-white/8 bg-background/80 px-4 pt-3 backdrop-blur-lg"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Button
            size="lg"
            onClick={() => setShowCamera(true)}
            className="h-auto gap-2 rounded-2xl py-4 text-base font-medium"
          >
            <Camera className="size-5" />
            Capture
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setShowManual(true)}
            className="h-auto gap-2 rounded-2xl py-4 text-base font-medium"
          >
            <PencilLine className="size-5" />
            Manual
          </Button>
        </div>
      </div>

      {/* Overlays */}
      {showCamera && <CameraCapture onClose={() => setShowCamera(false)} />}
      <ManualEntry open={showManual} onOpenChange={setShowManual} />
      <SettingsDialog
        settings={settings ?? null}
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
}
