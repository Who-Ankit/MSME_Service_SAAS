import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_CONFIG } from "@/config/admin.config";


export const ADMIN_SESSION_COOKIE = "ai_lead_agent_admin";

export function isValidAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_CONFIG.username && password === ADMIN_CONFIG.password;
}

export function isAdminAuthenticated(): boolean {
  return cookies().get(ADMIN_SESSION_COOKIE)?.value === ADMIN_CONFIG.sessionToken;
}

export function requireAdminResponse() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ detail: "Admin authentication required." }, { status: 401 });
  }
  return null;
}
