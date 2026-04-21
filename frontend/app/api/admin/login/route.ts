import { NextRequest, NextResponse } from "next/server";

import { ADMIN_CONFIG } from "@/config/admin.config";
import { ADMIN_SESSION_COOKIE, isValidAdminCredentials } from "@/lib/auth";


export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { username?: string; password?: string } | null;
  const username = body?.username?.trim() ?? "";
  const password = body?.password ?? "";

  if (!isValidAdminCredentials(username, password)) {
    return NextResponse.json({ detail: "Invalid username or password." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: ADMIN_CONFIG.sessionToken,
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
  return response;
}
