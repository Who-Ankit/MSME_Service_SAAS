"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { fetchServices, getServiceImageUrl } from "@/lib/api";
import type { PaginatedServices } from "@/lib/types";


const PAGE_SIZE = 3;

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount);
}

export default function ServiceCatalog() {
  const [data, setData] = useState<PaginatedServices | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchServices(page, PAGE_SIZE)
      .then((result) => {
        setData(result);
        setError("");
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load services.");
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6">
      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading &&
          Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <div key={index} className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-panel">
              <div className="mb-5 aspect-[16/9] animate-pulse rounded-[1.5rem] bg-slate-100" />
              <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-100" />
              <div className="mt-8 h-10 w-1/2 animate-pulse rounded-full bg-slate-200" />
            </div>
          ))}

        {!loading &&
          data?.items.map((service) => (
            <article key={service.id} className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-panel">
              {service.image_path && (
                <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100">
                  <Image
                    alt={service.title}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    src={getServiceImageUrl(service.image_path) || ""}
                    unoptimized
                  />
                </div>
              )}
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Service</p>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">{service.title}</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">{service.short_description || service.description}</p>
              <p className="mt-6 text-3xl font-bold text-slate-900">{formatPrice(service.price, service.currency)}</p>
              <p className="mt-2 text-sm text-slate-500">{service.description}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                  href={service.booking_url || `/lead-portal?service=${encodeURIComponent(service.slug)}`}
                >
                  Book Service
                </Link>
                <Link
                  className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                  href="/lead-portal"
                >
                  Contact Sales
                </Link>
              </div>
            </article>
          ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Showing page {data?.page ?? page} of {data?.total_pages ?? 1}
        </p>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => current - 1)}
            type="button"
          >
            Previous
          </button>
          <button
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading || page >= (data?.total_pages ?? 1)}
            onClick={() => setPage((current) => current + 1)}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
