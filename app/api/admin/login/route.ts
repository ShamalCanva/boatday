import { NextResponse } from "next/server";
import {
  checkPassword,
  createSessionCookieValue,
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE,
} from "@/lib/adminAuth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const value = await createSessionCookieValue();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return res;
}
