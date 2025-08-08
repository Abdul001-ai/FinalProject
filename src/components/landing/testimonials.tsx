export function Testimonials() {
  const items = [
    {
      name: "Ayesha Khan",
      role: "Head of Operations, FintechCo",
      quote:
        "Azad Call cut our missed calls to near zero and doubled booked demos. It paid for itself in a week.",
    },
    {
      name: "Daniel Perez",
      role: "Founder, ClinicOS",
      quote:
        "Patients get instant scheduling 24/7. The handoffs to staff are seamless and our CSAT went up 18%.",
    },
    {
      name: "Fatima Noor",
      role: "Growth Lead, RealEstatePro",
      quote:
        "The CRM sync is flawless. Our reps start the day with qualified leads and call summaries ready.",
    },
  ];

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Loved by modern teams</h2>
          <p className="mt-2 text-muted-foreground">Results, not promises.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((t) => (
            <figure key={t.name} className="rounded-xl border bg-card/60 p-6 backdrop-blur">
              <blockquote className="text-base leading-7"><span className="text-foreground/80">“{t.quote}”</span></blockquote>
              <figcaption className="mt-3 text-sm text-muted-foreground">{t.name} • {t.role}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
