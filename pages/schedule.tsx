import Head from "next/head";
import Link from "next/link";
import { CalendarClock } from "lucide-react";

import { useApp } from "@/context/AppContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/properties/StatusBadge";
import { getAllViewings, splitUpcomingPast, type ScheduledViewing } from "@/lib/schedule";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ScheduleRow({ scheduled }: { scheduled: ScheduledViewing }) {
  const { viewing, property } = scheduled;
  return (
    <Link
      href="/properties"
      data-testid="schedule-row"
      className="flex items-center justify-between gap-4 border-b px-4 py-4 last:border-b-0 hover:bg-accent/50"
    >
      <div className="min-w-0">
        <p className="font-medium">{formatDateTime(viewing.datetime)}</p>
        <p className="truncate text-sm text-muted-foreground">
          {property.title} — {property.address}
        </p>
      </div>
      <StatusBadge property={property} />
    </Link>
  );
}

function ScheduleContent() {
  const { properties } = useApp();
  const { upcoming, past } = splitUpcomingPast(getAllViewings(properties));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Viewing Schedule</h1>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <CalendarClock className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No upcoming viewings booked.</p>
          </div>
        ) : (
          <div className="rounded-lg border">
            {upcoming.map((s) => (
              <ScheduleRow key={s.viewing.id} scheduled={s} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Past
          </h2>
          <div className="rounded-lg border opacity-80">
            {past.map((s) => (
              <ScheduleRow key={s.viewing.id} scheduled={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function SchedulePage() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Viewing Schedule — Homie</title>
      </Head>
      <AppShell>
        <ScheduleContent />
      </AppShell>
    </ProtectedRoute>
  );
}
