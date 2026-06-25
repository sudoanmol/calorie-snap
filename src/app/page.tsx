"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { Loader2 } from "lucide-react";
import { Dashboard } from "@/components/dashboard";
import { SignIn } from "@/components/sign-in";

export default function Home() {
  return (
    <>
      <AuthLoading>
        <div className="grid min-h-dvh place-items-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AuthLoading>
      <Unauthenticated>
        <SignIn />
      </Unauthenticated>
      <Authenticated>
        <Dashboard />
      </Authenticated>
    </>
  );
}
