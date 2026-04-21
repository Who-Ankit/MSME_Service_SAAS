"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";


export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { detail?: string } | null;
      setError(body?.detail ?? "Login failed.");
      setSubmitting(false);
      return;
    }

    const nextPath = searchParams.get("next") || "/dashboard";
    router.push(nextPath);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-panel">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Admin Access</p>
      <h2 className="mt-3 text-3xl font-bold text-slate-900">Sign in to manage leads</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Credentials come from the local admin config file so you can manage them manually.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Username</span>
          <input
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
            onChange={(event) => setUsername(event.target.value)}
            value={username}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>

        {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        <button
          className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Signing In..." : "Login"}
        </button>
      </form>
    </div>
  );
}
