import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, isValidSessionCookieValue } from "@/lib/adminAuth";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The login page/route itself must stay reachable, or nobody could ever
  // log in in the first place.
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const valid = await isValidSessionCookieValue(cookie);

  if (!valid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}
