"use client";

import type { Lead } from "@/lib/types";


export type LeadFiltersState = {
  query: string;
  stage: Lead["stage"] | "all";
  source: string | "all";
};

type LeadFiltersProps = {
  filters: LeadFiltersState;
  sourceOptions: string[];
  onChange: (filters: LeadFiltersState) => void;
  onReset: () => void;
};

const stageOptions: Array<Lead["stage"] | "all"> = ["all", "New", "Contacted", "Replied", "Converted"];

export default function LeadFilters({ filters, sourceOptions, onChange, onReset }: LeadFiltersProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-5 shadow-panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <label className="block flex-1 space-y-2">
          <span className="text-sm font-medium text-slate-700">Search by name or email</span>
          <input
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500"
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            placeholder="Search leads"
            value={filters.query}
          />
        </label>
        <label className="block min-w-[180px] space-y-2">
          <span className="text-sm font-medium text-slate-700">Stage</span>
          <select
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500"
            onChange={(event) => onChange({ ...filters, stage: event.target.value as LeadFiltersState["stage"] })}
            value={filters.stage}
          >
            {stageOptions.map((stage) => (
              <option key={stage} value={stage}>
                {stage === "all" ? "All stages" : stage}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-[180px] space-y-2">
          <span className="text-sm font-medium text-slate-700">Source</span>
          <select
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500"
            onChange={(event) => onChange({ ...filters, source: event.target.value })}
            value={filters.source}
          >
            <option value="all">All sources</option>
            {sourceOptions.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </label>
        <button
          className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
          onClick={onReset}
          type="button"
        >
          Reset
        </button>
      </div>
    </section>
  );
}
