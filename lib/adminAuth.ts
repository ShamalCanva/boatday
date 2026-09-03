// Deliberately Edge-runtime-safe (no Node-only "crypto"/"buffer" APIs) since
// this is imported from middleware.ts, which runs on the Edge runtime by
// default. Uses Web Crypto (globalThis.crypto.subtle), available in both
// Node 20+ and Edge.

export const ADMIN_COOKIE_NAME = "boatday_admin";
const SESSION_DAYS = 90;
export const ADMIN_SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60; // seconds

function toBase64Url(bytes: ArrayBuffer): string {
  const arr = Array.from(new Uint8Array(bytes));
  const bin = arr.map((b) => String.fromCharCode(b)).join("");
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return toBase64Url(sig);
}

/** Not perfectly constant-time (length check short-circuits), but good
 *  enough for a personal admin password — not a target worth a timing
 *  side-channel attack. */
function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function requireSecret(): string {
  const secret = process.env.ADMIN_COOKIE_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_COOKIE_SECRET is not set. Add a long random string to .env.local / Vercel env vars."
    );
  }
  return secret;
}

export function checkPassword(input: string): boolean {
  const real = process.env.ADMIN_PASSWORD ?? "";
  if (!real) return false;
  return timingSafeEqualStr(input, real);
}

/** expiry timestamp + HMAC of that timestamp — nothing to reverse-engineer
 *  the password from, and self-expires without needing server-side storage. */
export async function createSessionCookieValue(): Promise<string> {
  const expiry = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const sig = await hmac(requireSecret(), String(expiry));
  return `${expiry}.${sig}`;
}

export async function isValidSessionCookieValue(value: string | undefined | null): Promise<boolean> {
  if (!value) return false;
  const [expiryStr, sig] = value.split(".");
  if (!expiryStr || !sig) return false;
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;
  const expected = await hmac(requireSecret(), expiryStr);
  return timingSafeEqualStr(sig, expected);
}
