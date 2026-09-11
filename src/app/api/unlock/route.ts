import { cookies } from "next/headers";
import {
  UNLOCK_COOKIE,
  UNLOCK_MAX_AGE_SEC,
  evaluateUnlock,
} from "@/lib/app-gate";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 401 });
  }

  const provided =
    body !== null && typeof body === "object" && "password" in body
      ? body.password
      : undefined;

  const result = evaluateUnlock(provided, process.env.APP_PASSWORD ?? "");
  if (result.kind === "denied") {
    return Response.json({ ok: false }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(UNLOCK_COOKIE, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: UNLOCK_MAX_AGE_SEC,
  });

  return Response.json({ ok: true });
}
