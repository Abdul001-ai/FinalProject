import { SITE_NAME } from "@/constants";

export function Integrations() {
  const logos = [
    { name: "Salesforce", svg: "SF" },
    { name: "HubSpot", svg: "HB" },
    { name: "Calendly", svg: "CL" },
    { name: "Zapier", svg: "ZP" },
    { name: "Stripe", svg: "ST" },
  ];
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-muted-foreground">
          {SITE_NAME} connects with your stack
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {logos.map((logo) => (
            <div key={logo.name} className="flex items-center justify-center rounded-xl border bg-card/50 py-6 backdrop-blur">
              <span className="text-sm font-semibold tracking-wide text-foreground/70">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
