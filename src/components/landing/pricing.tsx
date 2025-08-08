import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    period: "/mo",
    features: [
      "1 number",
      "500 minutes",
      "Basic routing",
      "Email summaries",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$49",
    period: "/mo",
    features: [
      "3 numbers",
      "3,000 minutes",
      "Advanced routing",
      "CRM & calendar sync",
      "Webhooks",
    ],
    cta: "Choose Growth",
    highlight: true,
  },
  {
    name: "Scale",
    price: "Custom",
    period: "",
    features: [
      "Unlimited numbers",
      "Volume pricing",
      "SLA & compliance",
      "Dedicated support",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple pricing</h2>
          <p className="mt-3 text-muted-foreground">Start free and scale as you grow.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className={`rounded-xl border p-6 ${t.highlight ? 'bg-primary/5 ring-1 ring-primary/30' : 'bg-card/60'} backdrop-blur`}>
              <h3 className="text-lg font-semibold">{t.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{t.price}</span>
                <span className="text-sm text-muted-foreground">{t.period}</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {t.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <div className="mt-6">
                <Button className="w-full" variant={t.highlight ? 'default' : 'outline'}>{t.cta}</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
