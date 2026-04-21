import ServiceCatalog from "@/components/ServiceCatalog";


export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">Services</p>
        <h2 className="mt-3 text-3xl font-bold text-slate-900">Choose the service that matches your growth stage.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Browse our current service catalog. Pricing is controlled by the admin team, and each page shows 3 services at a time for a cleaner public experience.
        </p>
      </section>

      <ServiceCatalog />
    </div>
  );
}
