import { Button } from "@/components/ui/button";
import { GITHUB_REPO_URL, SITE_NAME } from "@/constants";
import Link from "next/link";
import ShinyButton from "@/components/ui/shiny-button";
import { getTotalUsers } from "@/utils/stats";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-20 md:pt-28">
      {/* Gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_60rem_at_50%_-10%,hsl(var(--primary)/.15),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <ShinyButton className="mx-auto mb-6 rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
            Meet {SITE_NAME} — Your AI Call Agent
          </ShinyButton>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Handle calls automatically with human‑like intelligence
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {SITE_NAME} answers, routes, books appointments, and captures leads 24/7. Natural
            voice, real‑time reasoning, and CRM sync out of the box.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/sign-up">
              <Button size="lg" className="rounded-full px-6">Start free</Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg" className="rounded-full px-6">Live demo</Button>
            </Link>
            <a href={GITHUB_REPO_URL} target="_blank" className="inline-flex">
              <Button variant="ghost" size="lg" className="rounded-full px-6">Star on GitHub</Button>
            </a>
          </div>
          <div className="mt-8 flex justify-center">
            <Suspense fallback={<TotalUsersButtonSkeleton />}>
              <TotalUsersButton />
            </Suspense>
          </div>
        </div>

        {/* Feature highlight cards */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-card/60 p-5 backdrop-blur">
            <p className="text-sm font-medium text-muted-foreground">Voice quality</p>
            <p className="mt-1 text-xl font-semibold">Natural, low‑latency speech</p>
          </div>
          <div className="rounded-xl border bg-card/60 p-5 backdrop-blur">
            <p className="text-sm font-medium text-muted-foreground">Integrations</p>
            <p className="mt-1 text-xl font-semibold">Calendars, CRMs, webhooks</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// This component will be wrapped in Suspense
async function TotalUsersButton() {
  const totalUsers = await getTotalUsers();

  if (!totalUsers) return null;

  return (
    <ShinyButton className="rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
      {totalUsers}+ teams trust {SITE_NAME}
    </ShinyButton>
  );
}

// Skeleton fallback for the TotalUsersButton
function TotalUsersButtonSkeleton() {
  return (
    <div className="rounded-full bg-primary/10 ring-1 ring-inset ring-primary/20 px-4 py-1.5 text-sm font-medium">
      <Skeleton className="w-40 h-5" />
    </div>
  );
}
