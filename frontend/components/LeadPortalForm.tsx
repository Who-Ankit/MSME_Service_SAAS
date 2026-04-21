"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { createPortalLead } from "@/lib/api";
import type { LeadPortalPayload } from "@/lib/types";


const steps = [
  { id: 1, title: "Basic Info" },
  { id: 2, title: "Professional Info" },
  { id: 3, title: "Qualification" }
] as const;

const initialForm: LeadPortalPayload = {
  name: "",
  email: "",
  phone: "",
  company: "",
  role: "",
  website: "",
  budget: "",
  intent: ""
};

export default function LeadPortalForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<LeadPortalPayload>(initialForm);

  const progress = useMemo(() => (step / steps.length) * 100, [step]);

  function updateField<K extends keyof LeadPortalPayload>(key: K, value: LeadPortalPayload[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validateCurrentStep(): string {
    if (step === 1) {
      if (!form.name.trim()) {
        return "Name is required.";
      }
      if (!form.email.trim()) {
        return "Email is required.";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        return "Enter a valid email address.";
      }
    }
    if (step === 3) {
      if (!form.budget) {
        return "Select a budget range.";
      }
      if (!form.intent) {
        return "Select an intent level.";
      }
    }
    return "";
  }

  function goNext() {
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    if (step === 1) {
      console.log("lead portal form started");
    }
    setStep((current) => Math.min(current + 1, steps.length));
  }

  function goPrevious() {
    setError("");
    setStep((current) => Math.max(current - 1, 1));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");
    console.log("lead portal form submitted");

    try {
      const lead = await createPortalLead(form);
      router.push(`/lead-portal/success?score=${lead.score ?? 0}&name=${encodeURIComponent(lead.name)}`);
    } catch (submissionError: unknown) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to submit the form.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-panel" onSubmit={handleSubmit}>
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-600">
            Step {step} of {steps.length}
          </p>
          <p className="text-sm text-slate-500">{steps[step - 1].title}</p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-teal-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {step === 1 && (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500"
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Jane Doe"
              value={form.name}
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500"
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="jane@company.com"
              type="email"
              value={form.email}
            />
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Phone</span>
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500"
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+91 98765 43210"
              value={form.phone}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Company</span>
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500"
              onChange={(event) => updateField("company", event.target.value)}
              placeholder="Acme"
              value={form.company}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Role</span>
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500"
              onChange={(event) => updateField("role", event.target.value)}
              placeholder="Founder"
              value={form.role}
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Website</span>
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500"
              onChange={(event) => updateField("website", event.target.value)}
              placeholder="https://company.com"
              value={form.website}
            />
          </label>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Budget</span>
            <select
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500"
              onChange={(event) => updateField("budget", event.target.value as LeadPortalPayload["budget"])}
              value={form.budget}
            >
              <option value="">Select budget</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Intent</span>
            <select
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500"
              onChange={(event) => updateField("intent", event.target.value as LeadPortalPayload["intent"])}
              value={form.intent}
            >
              <option value="">Select intent</option>
              <option value="exploring">Exploring</option>
              <option value="interested">Interested</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={step === 1 || submitting}
          onClick={goPrevious}
          type="button"
        >
          Previous
        </button>

        {step < steps.length ? (
          <button
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            onClick={goNext}
            type="button"
          >
            Next
          </button>
        ) : (
          <button
            className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>
    </form>
  );
}
