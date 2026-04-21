import { NextRequest, NextResponse } from "next/server";

import { requireAdminResponse } from "@/lib/auth";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001";

type RouteContext = {
  params: {
    serviceId: string;
  };
};

export async function PUT(request: NextRequest, context: RouteContext) {
  const authError = requireAdminResponse();
  if (authError) {
    return authError;
  }

  const body = await request.json();
  const response = await fetch(`${API_BASE_URL}/services/${context.params.serviceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  const data = await response.json().catch(() => null);
  return NextResponse.json(data, { status: response.status });
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const authError = requireAdminResponse();
  if (authError) {
    return authError;
  }

  const response = await fetch(`${API_BASE_URL}/services/${context.params.serviceId}`, {
    method: "DELETE",
    cache: "no-store"
  });

  const data = await response.json().catch(() => null);
  return NextResponse.json(data, { status: response.status });
}
