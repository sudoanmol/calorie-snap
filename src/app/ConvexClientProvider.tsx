"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { convexUrlFromEnv } from "@/lib/convex-url";

const convexUrl = convexUrlFromEnv();
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) return children;
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
