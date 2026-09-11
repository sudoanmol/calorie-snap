"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

export function PasswordGate() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: formData.get("password") }),
      });
      if (!res.ok) {
        toast.error("Wrong password.");
        return;
      }
      router.refresh();
    } catch {
      toast.error("Couldn't unlock. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-8 px-6">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-col items-center gap-3 text-center">
        <Image src="/icon.svg" alt="" width={64} height={64} className="rounded-2xl" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calorie Snap</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the password to open your food log.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            placeholder="••••••••"
            required
          />
        </div>
        <Button type="submit" disabled={submitting} className="mt-1 h-11 gap-2">
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Enter
        </Button>
      </form>
    </div>
  );
}
