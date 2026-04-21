import type { Lead } from "@/lib/types";


type MessagePreviewProps = {
  lead: Lead | null;
};

export default function MessagePreview({ lead }: MessagePreviewProps) {
  if (!lead) {
    return (
      <section className="min-w-0 rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 shadow-panel xl:sticky xl:top-6">
        <h2 className="text-lg font-semibold text-slate-900">Message Preview</h2>
        <p className="mt-3 text-sm text-slate-500">Select a lead to view generated email, LinkedIn, and follow-up content.</p>
      </section>
    );
  }

  const blocks = [
    { label: "Email", value: lead.email_message },
    { label: "LinkedIn", value: lead.linkedin_message },
    { label: "Follow-up", value: lead.followup_message }
  ];

  return (
    <section className="min-w-0 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-panel xl:sticky xl:top-6 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-slate-900">{lead.name}</h2>
          <p className="text-sm text-slate-500">
            {lead.company || "No company"} · {lead.role || "No role"}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          {lead.stage}
        </span>
      </div>

      <div className="space-y-4">
        {blocks.map((block) => (
          <div key={block.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{block.label}</p>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
              {block.value || `No ${block.label.toLowerCase()} generated yet.`}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
