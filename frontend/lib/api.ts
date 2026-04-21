import axios from "axios";

import type { Lead, LeadPortalPayload, PaginatedServices, Service, ServiceFormPayload } from "@/lib/types";


const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001"
});

export function getServiceImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) {
    return null;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001";
  return `${baseUrl}/service-media/${encodeURIComponent(imagePath)}`;
}

export async function fetchLeads(): Promise<Lead[]> {
  const response = await api.get<Lead[]>("/leads");
  return response.data;
}

export async function uploadLeads(file: File): Promise<{ message: string; count: number }> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<{ message: string; count: number }>("/leads/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
}

export async function scoreLead(leadId: number): Promise<void> {
  await api.post("/leads/score", { lead_id: leadId });
}

export async function generateOutreach(leadId: number): Promise<void> {
  await api.post("/outreach/generate", { lead_id: leadId });
}

export async function sendOutreachEmail(leadId: number): Promise<void> {
  await api.post("/outreach/send", { lead_id: leadId });
}

export async function generateFollowup(leadId: number): Promise<void> {
  await api.post("/followup/generate", { lead_id: leadId });
}

export async function updateStage(leadId: number, stage: Lead["stage"]): Promise<void> {
  await api.patch(`/leads/${leadId}/stage`, { stage });
}

export async function createPortalLead(payload: LeadPortalPayload): Promise<Lead> {
  const response = await api.post<Lead>("/leads/create", payload);
  return response.data;
}

export async function fetchServices(page = 1, pageSize = 3, includeInactive = false): Promise<PaginatedServices> {
  const response = await api.get<PaginatedServices>("/services", {
    params: {
      page,
      page_size: pageSize,
      include_inactive: includeInactive
    }
  });
  return response.data;
}

export async function createService(payload: ServiceFormPayload): Promise<Service> {
  const response = await api.post<Service>("/api/admin/services", payload, {
    baseURL: ""
  });
  return response.data;
}

export async function updateService(serviceId: number, payload: ServiceFormPayload): Promise<Service> {
  const response = await api.put<Service>(`/api/admin/services/${serviceId}`, payload, {
    baseURL: ""
  });
  return response.data;
}

export async function deleteService(serviceId: number): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`/api/admin/services/${serviceId}`, {
    baseURL: ""
  });
  return response.data;
}

export async function uploadServiceImage(serviceId: number, image: File): Promise<Service> {
  const formData = new FormData();
  formData.append("image", image);

  const response = await api.post<Service>(`/api/admin/services/${serviceId}/image`, formData, {
    baseURL: "",
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
}
