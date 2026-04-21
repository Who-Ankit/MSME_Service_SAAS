import { NextRequest, NextResponse } from "next/server";

import { requireAdminResponse } from "@/lib/auth";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001";

type RouteContext = {
  params: {
    serviceId: string;
  };
};

export async function POST(request: NextRequest, context: RouteContext) {
  const authError = requireAdminResponse();
  if (authError) {
    return authError;
  }

  const incomingFormData = await request.formData();
  const formData = new FormData();
  const image = incomingFormData.get("image");

  if (image instanceof File) {
    formData.append("image", image);
  }

  const response = await fetch(`${API_BASE_URL}/services/${context.params.serviceId}/image`, {
    method: "POST",
    body: formData,
    cache: "no-store"
  });

  const data = await response.json().catch(() => null);
  return NextResponse.json(data, { status: response.status });
}
