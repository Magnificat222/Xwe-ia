import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight route guard. Swap the cookie check below for `auth()` from
// lib/auth.ts once next-auth's edge-compatible session read is wired in.
const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/admin", "/favoris"];

export function middleware(request: NextRequest) {
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  if (!isProtected) return NextResponse.next();

  const sessionToken =
    request.cookies.get("authjs.session-token") ??
    request.cookies.get("__Secure-authjs.session-token");

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/admin/:path*", "/favoris/:path*"],
};
