"use client";

import type { Lead } from "@/lib/types";


type PipelineBoardProps = {
  leads: Lead[];
  onStageChange?: (leadId: number, stage: Lead["stage"]) => void;
};

const stageConfig: Array<{ title: Lead["stage"]; tone: string }> = [
  { title: "New", tone: "border-slate-200 bg-white" },
  { title: "Contacted", tone: "border-orange-200 bg-orange-50/70" },
  { title: "Replied", tone: "border-sky-200 bg-sky-50/70" },
  { title: "Converted", tone: "border-emerald-200 bg-emerald-50/80" }
];

export default function PipelineBoard({ leads, onStageChange }: PipelineBoardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-panel">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Pipeline Board</h2>
        <p className="text-sm text-slate-500">Track where each lead sits in the outreach journey.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {stageConfig.map((stage) => {
          const stageLeads = leads.filter((lead) => lead.stage === stage.title);

          return (
            <div key={stage.title} className={`rounded-3xl border p-4 ${stage.tone}`}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">{stage.title}</h3>
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-500">
                  {stageLeads.length}
                </span>
              </div>

              <div className="space-y-3">
                {stageLeads.map((lead) => (
                  <article key={lead.id} className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm">
                    <p className="font-semibold text-slate-900">{lead.name}</p>
                    <p className="text-sm text-slate-500">{lead.company || "Unknown company"}</p>
                    <p className="mt-2 text-xs text-slate-500">{lead.role || "Role unavailable"}</p>
                    <p className="mt-3 text-xs font-semibold text-slate-600">
                      Score: <span className="text-slate-900">{lead.score ?? "Not scored"}</span>
                    </p>
                    {onStageChange && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {stageConfig
                          .filter((target) => target.title !== lead.stage)
                          .map((target) => (
                            <button
                              key={target.title}
                              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-500 hover:text-slate-900"
                              onClick={() => onStageChange(lead.id, target.title)}
                              type="button"
                            >
                              Move to {target.title}
                            </button>
                          ))}
                      </div>
                    )}
                  </article>
                ))}
                {stageLeads.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-400">
                    No leads in this stage.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
