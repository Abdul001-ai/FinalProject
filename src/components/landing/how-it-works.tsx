import { SITE_NAME } from "@/constants";
import { ArrowRightIcon, PhoneIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

const steps = [
  {
    title: "Connect your number",
    desc: "Port or purchase a number. Set greetings and business hours in minutes.",
    icon: PhoneIcon,
  },
  {
    title: "Plug into your tools",
    desc: "Sync calendars and CRM. Configure webhooks to trigger workflows.",
    icon: CalendarDaysIcon,
  },
  {
    title: "Go live",
    desc: `${SITE_NAME} answers, qualifies, books, and hands off when needed.`,
    icon: ArrowRightIcon,
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-4 text-muted-foreground">Launch in minutes — not months.</p>
        </div>
        <ol className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          {steps.map((s) => (
            <li key={s.title} className="rounded-xl border bg-card/60 p-6 backdrop-blur">
              <s.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
