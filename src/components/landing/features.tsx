import {
  PhoneArrowDownLeftIcon as CallIcon,
  ArrowPathRoundedSquareIcon as AutomateIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  EnvelopeIcon,
  CommandLineIcon,
  CpuChipIcon as RealtimeIcon,
  GlobeAltIcon as GlobeIcon,
} from "@heroicons/react/24/outline";
import { SITE_NAME } from "@/constants";

const features = [
  {
    name: "Answer & route calls",
    description:
      `${SITE_NAME} greets callers, qualifies leads, and routes to the right destination or books meetings automatically.`,
    icon: CallIcon,
  },
  {
    name: "Real‑time reasoning",
    description:
      "Understands context, follows instructions, and adapts mid‑conversation with low‑latency voice.",
    icon: RealtimeIcon,
  },
  {
    name: "CRM & calendar sync",
    description:
      "Native hooks for CRMs, calendars, and webhooks so every call updates your systems instantly.",
    icon: EnvelopeIcon,
  },
  {
    name: "Automations",
    description:
      "Trigger workflows, send follow‑ups, and collect payments — no manual work required.",
    icon: AutomateIcon,
  },
  {
    name: "Security & compliance",
    description:
      "Role‑based access, audit logs, and data retention controls built in.",
    icon: ShieldCheckIcon,
  },
  {
    name: "Global scale",
    description:
      "Deployed at the edge for high availability and snappy response worldwide.",
    icon: GlobeIcon,
  },
  {
    name: "Developer‑first",
    description:
      "Type‑safe APIs, webhooks, and excellent docs. Ship faster with confidence.",
    icon: CommandLineIcon,
  },
  {
    name: "Launch in minutes",
    description:
      "Plug in your number, connect your stack, and go live — onboarding that just works.",
    icon: RocketLaunchIcon,
  },
];

export function Features() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Why teams choose {SITE_NAME}
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Handle more calls. Close more deals.
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Replace missed calls with delightful conversations. Automate the busywork while
            keeping humans in control.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                  <feature.icon
                    className="h-5 w-5 flex-none text-indigo-600 dark:text-indigo-400"
                    aria-hidden="true"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
