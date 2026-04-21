"use client";

import { useRouter } from "next/navigation";


type AdminAuthButtonProps = {
  authenticated: boolean;
};

export default function AdminAuthButton({ authenticated }: AdminAuthButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/lead-portal");
    router.refresh();
  }

  if (authenticated) {
    return (
      <button
        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:text-rose-700"
        onClick={handleLogout}
        type="button"
      >
        Logout
      </button>
    );
  }

  return (
    <a
      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
      href="/admin"
    >
      Admin Login
    </a>
  );
}
