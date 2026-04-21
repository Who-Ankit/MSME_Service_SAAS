import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

import AdminAuthButton from "@/components/AdminAuthButton";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";

import "./globals.css";


export const metadata: Metadata = {
  title: "AI Lead Agent",
  description: "Lead qualification and outreach MVP powered by FastAPI and Next.js."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAuthenticated = cookies().get(ADMIN_SESSION_COOKIE)?.value !== undefined;

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-slate-200/80 bg-white/75 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
              <div className="flex items-center gap-4">
                <AdminAuthButton authenticated={isAuthenticated} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-600">
                    AI Lead Agent
                  </p>
                  <h1 className="text-2xl font-bold text-slate-900">Lead Qualification Dashboard</h1>
                </div>
              </div>
              <nav className="flex gap-3 text-sm font-medium">
                <Link
                  href="/services"
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
                >
                  Services
                </Link>
                <Link
                  href="/lead-portal"
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                >
                  Lead Portal
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      href="/dashboard"
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:border-orange-300 hover:text-orange-600"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/pipeline"
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
                    >
                      Pipeline
                    </Link>
                    <Link
                      href="/service-admin"
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                    >
                      Service Admin
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
