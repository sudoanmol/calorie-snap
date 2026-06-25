"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("flow", flow);
    try {
      await signIn("password", formData);
    } catch {
      toast.error(
        flow === "signIn"
          ? "Couldn't sign in. Check your email and password."
          : "Couldn't sign up. This email may not be allowed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-8 px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Image src="/icon.svg" alt="" width={64} height={64} className="rounded-2xl" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calorie Snap</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {flow === "signIn"
              ? "Sign in to your food log."
              : "Create your account."}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={flow === "signIn" ? "current-password" : "new-password"}
            placeholder="••••••••"
            required
          />
        </div>
        <Button type="submit" disabled={submitting} className="mt-1 h-11 gap-2">
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </Button>
      </form>

      <Button
        type="button"
        variant="ghost"
        onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
        className="text-sm font-normal text-muted-foreground"
      >
        {flow === "signIn"
          ? "Need an account? Sign up"
          : "Already have an account? Sign in"}
      </Button>
    </div>
  );
}
