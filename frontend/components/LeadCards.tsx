"use client";

import type { Lead } from "@/lib/types";


type LeadCardsProps = {
  leads: Lead[];
  activeLeadId: number | null;
  busyLeadId: number | null;
  onSelectLead: (lead: Lead) => void;
  onScore: (leadId: number) => void;
  onGenerateOutreach: (leadId: number) => void;
  onSendEmail: (leadId: number) => void;
  onGenerateFollowup: (leadId: number) => void;
  onStageChange: (leadId: number, stage: Lead["stage"]) => void;
};

const stages: Lead["stage"][] = ["New", "Contacted", "Replied", "Converted"];

export default function LeadCards({
  leads,
  activeLeadId,
  busyLeadId,
  onSelectLead,
  onScore,
  onGenerateOutreach,
  onSendEmail,
  onGenerateFollowup,
  onStageChange
}: LeadCardsProps) {
  return (
    <section className="space-y-4 lg:hidden">
      {leads.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/75 p-6 text-center text-sm text-slate-500 shadow-panel">
          No leads match the current filters.
        </div>
      )}
      {leads.map((lead) => {
        const isActive = lead.id === activeLeadId;
        const isBusy = lead.id === busyLeadId;

        return (
          <article
            key={lead.id}
            className={`rounded-3xl border bg-white/90 p-5 shadow-panel transition ${
              isActive ? "border-orange-300 bg-orange-50/40" : "border-slate-200"
            }`}
          >
            <button className="w-full text-left" onClick={() => onSelectLead(lead)} type="button">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-slate-900">{lead.name}</p>
                  <p className="truncate text-sm text-slate-500">{lead.email}</p>
                  <p className="mt-1 text-xs text-slate-400">{lead.company || "Unknown company"} · {lead.role || "No role"}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {lead.stage}
                </span>
              </div>
            </button>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Score</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{lead.score ?? "Not scored"}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{lead.score_reason || "No score reason yet."}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Source</p>
                <p className="mt-2 text-sm font-semibold capitalize text-slate-900">{lead.source || "unknown"}</p>
                <p className="mt-2 text-xs text-slate-500">{lead.website || "No website provided"}</p>
              </div>
            </div>

            <div className="mt-4">
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500"
                value={lead.stage}
                onChange={(event) => onStageChange(lead.id, event.target.value as Lead["stage"])}
              >
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={isBusy}
                onClick={() => onScore(lead.id)}
                type="button"
              >
                Score
              </button>
              <button
                className="rounded-full bg-orange-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-200"
                disabled={isBusy}
                onClick={() => onGenerateOutreach(lead.id)}
                type="button"
              >
                Generate Message
              </button>
              <button
                className="rounded-full bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-200"
                disabled={isBusy || !lead.email_message}
                onClick={() => onSendEmail(lead.id)}
                type="button"
              >
                Send Email
              </button>
              <button
                className="rounded-full bg-teal-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-200"
                disabled={isBusy}
                onClick={() => onGenerateFollowup(lead.id)}
                type="button"
              >
                Generate Follow-up
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}
