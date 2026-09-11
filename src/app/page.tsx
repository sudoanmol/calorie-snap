import { cookies } from "next/headers";
import { Dashboard } from "@/components/dashboard";
import { PasswordGate } from "@/components/password-gate";
import { UNLOCK_COOKIE, isValidUnlockToken } from "@/lib/app-gate";
import { convexUrlFromEnv } from "@/lib/convex-url";

export default async function Home() {
  const token = (await cookies()).get(UNLOCK_COOKIE)?.value;
  const password = process.env.APP_PASSWORD ?? "";
  const unlocked =
    token !== undefined && isValidUnlockToken(token, password);

  if (!unlocked) return <PasswordGate />;
  if (!convexUrlFromEnv()) {
    return (
      <div className="grid min-h-dvh place-items-center px-6 text-center text-sm text-muted-foreground">
        Set NEXT_PUBLIC_CONVEX_URL in .env.local and restart.
      </div>
    );
  }
  return <Dashboard />;
}
