import { NextRequest, NextResponse } from "next/server";

import { requireAdminResponse } from "@/lib/auth";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001";

export async function POST(request: NextRequest) {
  const authError = requireAdminResponse();
  if (authError) {
    return authError;
  }

  const body = await request.json();
  const response = await fetch(`${API_BASE_URL}/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  const data = await response.json().catch(() => null);
  return NextResponse.json(data, { status: response.status });
}
