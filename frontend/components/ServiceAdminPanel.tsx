"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { createService, deleteService, fetchServices, getServiceImageUrl, updateService, uploadServiceImage } from "@/lib/api";
import type { Service, ServiceFormPayload } from "@/lib/types";


const emptyForm: ServiceFormPayload = {
  title: "",
  slug: "",
  short_description: "",
  description: "",
  price: 0,
  currency: "USD",
  booking_url: "",
  is_active: true
};

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount);
}

function buildSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }
          if (item && typeof item === "object") {
            const location = Array.isArray(item.loc) ? item.loc.join(" > ") : "field";
            const message = typeof item.msg === "string" ? item.msg : "Invalid value";
            return `${location}: ${message}`;
          }
          return "Invalid request";
        })
        .join(" | ");
    }
    return error.message;
  }
  return error instanceof Error ? error.message : "Unable to save service.";
}

export default function ServiceAdminPanel() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<ServiceFormPayload>(emptyForm);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [status, setStatus] = useState("Create and manage your public services here.");
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function loadServices() {
    const data = await fetchServices(1, 100, true);
    setServices(data.items);
  }

  useEffect(() => {
    loadServices().catch((error: unknown) => {
      setStatus(error instanceof Error ? error.message : "Unable to load services.");
    });
  }, []);

  const submitLabel = useMemo(() => (editingServiceId ? "Update Service" : "Create Service"), [editingServiceId]);
  const suggestedSlug = useMemo(() => buildSlug(form.slug || form.title), [form.slug, form.title]);
  const activeImageUrl = useMemo(() => {
    if (previewUrl) {
      return previewUrl;
    }

    if (!editingServiceId) {
      return null;
    }

    const currentService = services.find((service) => service.id === editingServiceId);
    return getServiceImageUrl(currentService?.image_path);
  }, [editingServiceId, previewUrl, services]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function beginEdit(service: Service) {
    setEditingServiceId(service.id);
    setForm({
      title: service.title,
      slug: service.slug,
      short_description: service.short_description,
      description: service.description,
      price: Number(service.price),
      currency: service.currency,
      booking_url: service.booking_url || "",
      is_active: service.is_active
    });
    setSelectedImage(null);
    setPreviewUrl(getServiceImageUrl(service.image_path));
    setStatus(`Editing ${service.title}.`);
  }

  function resetForm() {
    setEditingServiceId(null);
    setForm(emptyForm);
    setSelectedImage(null);
    setPreviewUrl(null);
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedImage(file);

    setPreviewUrl((current) => {
      if (current?.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }
      return file ? URL.createObjectURL(file) : null;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const normalizedSlug = buildSlug(form.slug || form.title);
      if (!form.title.trim()) {
        throw new Error("Title is required.");
      }
      if (!normalizedSlug) {
        throw new Error("Slug could not be generated. Add a title or slug.");
      }

      const payload: ServiceFormPayload = {
        ...form,
        title: form.title.trim(),
        slug: normalizedSlug,
        short_description: form.short_description.trim(),
        description: form.description.trim(),
        booking_url: form.booking_url.trim(),
        currency: form.currency.trim().toUpperCase() || "USD"
      };

      if (editingServiceId) {
        await updateService(editingServiceId, payload);
        if (selectedImage) {
          await uploadServiceImage(editingServiceId, selectedImage);
        }
        setStatus("Service updated successfully.");
      } else {
        const createdService = await createService(payload);
        if (selectedImage) {
          await uploadServiceImage(createdService.id, selectedImage);
        }
        setStatus("Service created successfully.");
      }
      await loadServices();
      resetForm();
    } catch (error: unknown) {
      setStatus(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(service: Service) {
    setSubmitting(true);
    try {
      await deleteService(service.id);
      setStatus(`${service.title} deleted successfully.`);
      if (editingServiceId === service.id) {
        resetForm();
      }
      await loadServices();
    } catch (error: unknown) {
      setStatus(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-panel" onSubmit={handleSubmit}>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">Service Admin</p>
        <h2 className="mt-3 text-3xl font-bold text-slate-900">{submitLabel}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Control public pricing, descriptions, booking links, and whether each service is visible.
        </p>

        <div className="mt-6 grid gap-4">
          <input className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-teal-500" placeholder="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          <div className="space-y-2">
            <input className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-teal-500" placeholder="Slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
            <p className="text-xs text-slate-500">
              {form.slug.trim() ? `Using slug: ${buildSlug(form.slug)}` : `Auto slug: ${suggestedSlug || "generated from title"}`}
            </p>
          </div>
          <textarea className="min-h-[96px] rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-teal-500" placeholder="Short description" value={form.short_description} onChange={(event) => setForm((current) => ({ ...current, short_description: event.target.value }))} />
          <textarea className="min-h-[140px] rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-teal-500" placeholder="Full description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-teal-500" min="0" placeholder="Price" step="0.01" type="number" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))} />
            <input className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-teal-500" placeholder="Currency" value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))} />
          </div>
          <input className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-teal-500" placeholder="Booking URL (optional)" value={form.booking_url} onChange={(event) => setForm((current) => ({ ...current, booking_url: event.target.value }))} />
          <div className="rounded-2xl border border-slate-300 px-4 py-3">
            <label className="text-sm font-semibold text-slate-700" htmlFor="service-image">
              Service image
            </label>
            <input
              accept=".jpg,.jpeg,.png,.webp,.gif,.svg"
              className="mt-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-teal-100 file:px-4 file:py-2 file:font-semibold file:text-teal-700 hover:file:bg-teal-200"
              id="service-image"
              onChange={handleImageChange}
              type="file"
            />
            <p className="mt-2 text-xs text-slate-500">Stored locally on disk and shown on the public services page.</p>
            {activeImageUrl && (
              <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                <div className="relative aspect-[16/9] w-full">
                  <Image alt="Service preview" className="object-cover" fill sizes="(max-width: 768px) 100vw, 40vw" src={activeImageUrl} unoptimized />
                </div>
              </div>
            )}
          </div>
          <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} type="checkbox" />
            Show this service publicly
          </label>
        </div>

        <p className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-slate-100">{status}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-300" disabled={submitting} type="submit">
            {submitting ? "Saving..." : submitLabel}
          </button>
          <button className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900" onClick={resetForm} type="button">
            Reset
          </button>
        </div>
      </form>

      <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-600">Existing Services</p>
        <h2 className="mt-3 text-3xl font-bold text-slate-900">Current catalog</h2>
        <div className="mt-6 space-y-4">
          {services.map((service) => (
            <article key={service.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              {service.image_path && (
                <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                  <Image
                    alt={service.title}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    src={getServiceImageUrl(service.image_path) || ""}
                    unoptimized
                  />
                </div>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{service.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{service.slug}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{service.short_description}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900">{formatPrice(Number(service.price), service.currency)}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {service.is_active ? "Active" : "Hidden"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                  disabled={submitting}
                  onClick={() => beginEdit(service)}
                  type="button"
                >
                  Edit Service
                </button>
                <button
                  className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-500 hover:text-rose-900 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={submitting}
                  onClick={() => handleDelete(service)}
                  type="button"
                >
                  Delete Service
                </button>
                <Link
                  className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                  href={service.booking_url || `/lead-portal?service=${encodeURIComponent(service.slug)}`}
                >
                  Book Now
                </Link>
              </div>
            </article>
          ))}
          {services.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-6 text-center text-sm text-slate-500">
              No services added yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
