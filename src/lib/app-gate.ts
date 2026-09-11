import { createHmac, timingSafeEqual } from "node:crypto";

export const UNLOCK_COOKIE = "calorie_snap_unlock";
export const UNLOCK_MAX_AGE_SEC = 60 * 60 * 24 * 30;

export type UnlockResult =
  | { kind: "ok"; token: string }
  | { kind: "denied" };

function hmac(password: string, payload: string): string {
  return createHmac("sha256", password).update(payload).digest("base64url");
}

function equal(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function createUnlockToken(password: string, nowMs = Date.now()): string {
  const exp = nowMs + UNLOCK_MAX_AGE_SEC * 1000;
  const payload = String(exp);
  return `${payload}.${hmac(password, payload)}`;
}

export function isValidUnlockToken(
  token: string,
  password: string,
  nowMs = Date.now(),
): boolean {
  if (password.length === 0) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = hmac(password, payload);
  if (!equal(sig, expected)) return false;
  const exp = Number(payload);
  if (!Number.isFinite(exp) || exp <= nowMs) return false;
  return true;
}

export function evaluateUnlock(
  provided: unknown,
  expected: string,
): UnlockResult {
  if (expected.length === 0) return { kind: "denied" };
  if (typeof provided !== "string") return { kind: "denied" };
  if (!equal(provided, expected)) return { kind: "denied" };
  return { kind: "ok", token: createUnlockToken(expected) };
}
