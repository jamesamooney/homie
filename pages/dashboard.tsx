import Head from "next/head";
import Link from "next/link";
import { Bell, CalendarClock, Home as HomeIcon } from "lucide-react";

import { useApp } from "@/context/AppContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllViewings, splitUpcomingPast } from "@/lib/schedule";

/**
 * Mission-control landing screen — the buyer sees this immediately after login and
 * drills into My Properties / Viewing Schedule / Notifications from here.
 */
function DashboardContent() {
  const { user, properties, notifications, unreadCount } = useApp();
  const visible = properties.filter((p) => !p.removed);
  const active = visible.filter((p) => p.decision !== "not_interested");
  const archived = visible.filter((p) => p.decision === "not_interested");

  const { upcoming } = splitUpcomingPast(getAllViewings(properties));
  const nextViewing = upcoming[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back{user ? `, ${user}` : ""}</h1>
        <p className="text-sm text-muted-foreground">Here&rsquo;s where things stand.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/properties" data-testid="tile-properties">
          <Card className="h-full transition-colors hover:bg-accent/50">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HomeIcon className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">My Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {active.length} active
                {archived.length > 0 ? ` · ${archived.length} archived` : ""}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/schedule" data-testid="tile-schedule">
          <Card className="h-full transition-colors hover:bg-accent/50">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarClock className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Viewing Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {nextViewing
                  ? `Next: ${nextViewing.property.address} — ${new Date(
                      nextViewing.viewing.datetime,
                    ).toLocaleString(undefined, {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}`
                  : "No viewings booked"}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/notifications" data-testid="tile-notifications">
          <Card className="h-full transition-colors hover:bg-accent/50">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bell className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : notifications.length > 0
                    ? "All caught up"
                    : "No notifications yet"}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Dashboard — Homie</title>
      </Head>
      <AppShell>
        <DashboardContent />
      </AppShell>
    </ProtectedRoute>
  );
}
