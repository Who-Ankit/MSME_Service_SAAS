import Link from "next/link";


function getScoreMessage(score: number): string {
  if (score > 80) {
    return "You're a high priority lead. Book a call now.";
  }
  if (score >= 50) {
    return "We'll reach out soon.";
  }
  return "Thanks! We'll stay in touch.";
}

type LeadPortalSuccessPageProps = {
  searchParams?: {
    name?: string;
    score?: string;
  };
};

export default function LeadPortalSuccessPage({ searchParams }: LeadPortalSuccessPageProps) {
  const score = Number(searchParams?.score ?? 0);
  const name = searchParams?.name ?? "there";

  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-panel">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-600">Submission Received</p>
      <h2 className="mt-3 text-3xl font-bold text-slate-900">Thanks, {name}.</h2>
      <p className="mt-4 text-lg text-slate-700">{getScoreMessage(score)}</p>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Our system has already qualified your submission and prepared the next outreach steps for the admin team.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          className="rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          href="https://calendly.com/"
          target="_blank"
        >
          Book a Call
        </Link>
        <Link
          className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
          href="/lead-portal"
        >
          Submit Another Lead
        </Link>
      </div>
    </div>
  );
}
