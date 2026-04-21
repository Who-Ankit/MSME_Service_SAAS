import { NextRequest, NextResponse } from "next/server";

import { ADMIN_CONFIG } from "@/config/admin.config";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";


const protectedPaths = ["/dashboard", "/pipeline", "/service-admin"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = request.cookies.get(ADMIN_SESSION_COOKIE)?.value === ADMIN_CONFIG.sessionToken;

  if (pathname === "/admin" && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    if (!authenticated) {
      const loginUrl = new URL("/admin", request.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/dashboard/:path*", "/pipeline/:path*", "/service-admin/:path*"]
};
