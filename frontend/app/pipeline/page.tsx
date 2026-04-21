"use client";

import { useEffect, useState } from "react";

import PipelineBoard from "@/components/PipelineBoard";
import { fetchLeads, updateStage } from "@/lib/api";
import type { Lead } from "@/lib/types";


export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState("Loading pipeline...");

  async function loadLeads() {
    const data = await fetchLeads();
    setLeads(data);
  }

  useEffect(() => {
    loadLeads()
      .then(() => setStatus("Pipeline is ready."))
      .catch((error: unknown) => {
        setStatus(error instanceof Error ? error.message : "Unable to load pipeline.");
      });
  }, []);

  async function handleStageChange(leadId: number, stage: Lead["stage"]) {
    try {
      await updateStage(leadId, stage);
      await loadLeads();
      setStatus(`Lead moved to ${stage}.`);
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : "Stage update failed.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">Pipeline View</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Visualize where every lead sits in the funnel.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Outreach generation moves leads to Contacted automatically, and you can move them between later stages from this board.
        </p>
        <p className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm text-slate-100">{status}</p>
      </section>

      <PipelineBoard leads={leads} onStageChange={handleStageChange} />
    </div>
  );
}
