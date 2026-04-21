"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

import LeadTable from "@/components/LeadTable";
import LeadCards from "@/components/LeadCards";
import LeadFilters, { type LeadFiltersState } from "@/components/LeadFilters";
import MessagePreview from "@/components/MessagePreview";
import {
  fetchLeads,
  generateFollowup,
  generateOutreach,
  scoreLead,
  sendOutreachEmail,
  updateStage,
  uploadLeads
} from "@/lib/api";
import type { Lead } from "@/lib/types";


const PAGE_SIZE = 5;
const defaultFilters: LeadFiltersState = {
  query: "",
  stage: "all",
  source: "all"
};

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [busyLeadId, setBusyLeadId] = useState<number | null>(null);
  const [status, setStatus] = useState("Load a CSV to start qualifying leads.");
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<LeadFiltersState>(defaultFilters);

  async function loadLeads(preferredLeadId?: number) {
    const data = await fetchLeads();
    setLeads(data);

    const nextLead =
      data.find((lead) => lead.id === preferredLeadId) ??
      data.find((lead) => lead.id === activeLead?.id) ??
      data[0] ??
      null;

    setActiveLead(nextLead);
  }

  useEffect(() => {
    loadLeads().catch((error: unknown) => {
      setStatus(error instanceof Error ? error.message : "Unable to load leads.");
    });
  }, []);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    try {
      const result = await uploadLeads(file);
      setStatus(result.message);
      await loadLeads();
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function runLeadAction(leadId: number, action: () => Promise<void>, successMessage: string) {
    setBusyLeadId(leadId);
    try {
      await action();
      await loadLeads(leadId);
      setStatus(successMessage);
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : "Action failed.");
    } finally {
      setBusyLeadId(null);
    }
  }

  const sourceOptions = useMemo(
    () => Array.from(new Set(leads.map((lead) => lead.source || "unknown"))).sort(),
    [leads]
  );

  const filteredLeads = useMemo(() => {
    const normalizedQuery = filters.query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesQuery =
        !normalizedQuery ||
        lead.name.toLowerCase().includes(normalizedQuery) ||
        lead.email.toLowerCase().includes(normalizedQuery);
      const matchesStage = filters.stage === "all" || lead.stage === filters.stage;
      const leadSource = lead.source || "unknown";
      const matchesSource = filters.source === "all" || leadSource === filters.source;
      return matchesQuery && matchesStage && matchesSource;
    });
  }, [filters, leads]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    const nextTotalPages = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
    setCurrentPage((page) => Math.min(page, nextTotalPages));
  }, [filteredLeads.length]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-panel lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-600">Sales Ops MVP</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Upload leads, score intent, and generate outreach in one place.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            The dashboard keeps qualification, messaging, and pipeline movement simple so you can validate the workflow fast.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center transition hover:border-orange-300 hover:bg-orange-50/40">
            <span className="text-sm font-semibold text-slate-700">
              {uploading ? "Uploading..." : "Upload CSV"}
            </span>
            <span className="mt-2 text-xs text-slate-500">Expected columns: name, email, company, role, website</span>
            <input accept=".csv" className="hidden" onChange={handleUpload} type="file" />
          </label>
          <p className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-slate-100">{status}</p>
        </div>
      </section>

      <LeadFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
        sourceOptions={sourceOptions}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <LeadCards
            activeLeadId={activeLead?.id ?? null}
            busyLeadId={busyLeadId}
            leads={paginatedLeads}
            onGenerateFollowup={(leadId) =>
              runLeadAction(leadId, () => generateFollowup(leadId), "Follow-up generated.")
            }
            onGenerateOutreach={(leadId) =>
              runLeadAction(leadId, () => generateOutreach(leadId), "Outreach content generated.")
            }
            onSendEmail={(leadId) =>
              runLeadAction(leadId, () => sendOutreachEmail(leadId), "Email sent successfully.")
            }
            onScore={(leadId) => runLeadAction(leadId, () => scoreLead(leadId), "Lead scored successfully.")}
            onSelectLead={setActiveLead}
            onStageChange={(leadId, stage) =>
              runLeadAction(leadId, () => updateStage(leadId, stage), `Lead moved to ${stage}.`)
            }
          />
          <div className="hidden lg:block">
            <LeadTable
              activeLeadId={activeLead?.id ?? null}
              busyLeadId={busyLeadId}
              currentPage={currentPage}
              leads={paginatedLeads}
              onGenerateFollowup={(leadId) =>
                runLeadAction(leadId, () => generateFollowup(leadId), "Follow-up generated.")
              }
              onGenerateOutreach={(leadId) =>
                runLeadAction(leadId, () => generateOutreach(leadId), "Outreach content generated.")
              }
              onPageChange={setCurrentPage}
              onSendEmail={(leadId) =>
                runLeadAction(leadId, () => sendOutreachEmail(leadId), "Email sent successfully.")
              }
              onScore={(leadId) => runLeadAction(leadId, () => scoreLead(leadId), "Lead scored successfully.")}
              onSelectLead={setActiveLead}
              onStageChange={(leadId, stage) =>
                runLeadAction(leadId, () => updateStage(leadId, stage), `Lead moved to ${stage}.`)
              }
              pageSize={PAGE_SIZE}
              totalLeads={filteredLeads.length}
              totalPages={totalPages}
            />
          </div>
        </div>
        <MessagePreview lead={activeLead} />
      </div>
    </div>
  );
}
