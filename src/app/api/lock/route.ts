import { cookies } from "next/headers";
import { UNLOCK_COOKIE } from "@/lib/app-gate";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(UNLOCK_COOKIE);
  return Response.json({ ok: true });
}
