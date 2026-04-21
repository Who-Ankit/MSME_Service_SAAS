"use client";

import type { Lead } from "@/lib/types";


type LeadTableProps = {
  leads: Lead[];
  activeLeadId: number | null;
  busyLeadId: number | null;
  currentPage: number;
  totalPages: number;
  totalLeads: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSelectLead: (lead: Lead) => void;
  onScore: (leadId: number) => void;
  onGenerateOutreach: (leadId: number) => void;
  onSendEmail: (leadId: number) => void;
  onGenerateFollowup: (leadId: number) => void;
  onStageChange: (leadId: number, stage: Lead["stage"]) => void;
};

const stages: Lead["stage"][] = ["New", "Contacted", "Replied", "Converted"];

export default function LeadTable({
  leads,
  activeLeadId,
  busyLeadId,
  currentPage,
  totalPages,
  totalLeads,
  pageSize,
  onPageChange,
  onSelectLead,
  onScore,
  onGenerateOutreach,
  onSendEmail,
  onGenerateFollowup,
  onStageChange
}: LeadTableProps) {
  const startItem = totalLeads === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalLeads);

  return (
    <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white/85 shadow-panel">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Lead Table</h2>
          <p className="text-sm text-slate-500">Upload a CSV, score leads, and generate outreach from one view.</p>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {startItem}-{endItem} of {totalLeads}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1100px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Lead</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="w-[120px] px-4 py-3 font-medium">Source</th>
              <th className="w-[240px] px-4 py-3 font-medium">Score</th>
              <th className="w-[140px] px-4 py-3 font-medium">Stage</th>
              <th className="w-[360px] px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const isActive = lead.id === activeLeadId;
              const isBusy = lead.id === busyLeadId;

              return (
                <tr
                  key={lead.id}
                  className={`border-t border-slate-100 transition ${isActive ? "bg-orange-50/60" : "hover:bg-slate-50"}`}
                >
                  <td className="px-4 py-4 align-top">
                    <button className="text-left" onClick={() => onSelectLead(lead)} type="button">
                      <p className="font-semibold text-slate-900">{lead.name}</p>
                      <p className="text-slate-500">{lead.email}</p>
                      <p className="text-xs text-slate-400">{lead.role || "Role unavailable"}</p>
                    </button>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <p className="font-medium text-slate-700">{lead.company || "Unknown"}</p>
                    <p className="text-xs text-slate-400">{lead.website || "No website"}</p>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                      {lead.source || "unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="inline-flex min-w-20 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {lead.score ?? "Not scored"}
                    </div>
                    <p className="mt-2 max-w-[220px] text-xs leading-5 text-slate-500">
                      {lead.score_reason || "No score reason yet."}
                    </p>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <select
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-0 transition focus:border-teal-500"
                      value={lead.stage}
                      onChange={(event) => onStageChange(lead.id, event.target.value as Lead["stage"])}
                    >
                      {stages.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
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
                  </td>
                </tr>
              );
            })}
            {leads.length === 0 && (
              <tr>
                <td className="px-4 py-12 text-center text-slate-500" colSpan={6}>
                  No leads match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Showing {startItem}-{endItem} of {totalLeads} leads
        </p>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            type="button"
          >
            Previous
          </button>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            Page {currentPage} of {Math.max(totalPages, 1)}
          </div>
          <button
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
