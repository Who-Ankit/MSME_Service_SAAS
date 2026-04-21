import LeadPortalForm from "@/components/LeadPortalForm";


export default function LeadPortalPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">Lead Portal</p>
        <h2 className="mt-3 text-3xl font-bold text-slate-900">Share a few details and we will tailor the next step automatically.</h2>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          This public intake flow creates a lead, scores it with AI, prepares outreach, and drafts a follow-up in the background.
        </p>
        <div className="mt-8 space-y-3 rounded-3xl bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-900">What happens after submit</p>
          <p className="text-sm text-slate-600">1. Your details are saved as a new lead from the portal.</p>
          <p className="text-sm text-slate-600">2. AI scores the opportunity automatically.</p>
          <p className="text-sm text-slate-600">3. Outreach and follow-up drafts are generated for the admin team.</p>
        </div>
      </section>
      <LeadPortalForm />
    </div>
  );
}
