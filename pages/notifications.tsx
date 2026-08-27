import { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { Bell } from "lucide-react";

import { useApp } from "@/context/AppContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";

function absoluteTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function NotificationsContent() {
  const { notifications, properties, markAllNotificationsRead } = useApp();

  // Opening the full list is as good as opening the bell — mark everything read.
  useEffect(() => {
    markAllNotificationsRead();
  }, [markAllNotificationsRead]);

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      {sorted.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" className="py-12" />
      ) : (
        <div className="divide-y rounded-lg border">
          {sorted.map((n) => {
            const property = properties.find((p) => p.id === n.propertyId);
            return (
              <div
                key={n.id}
                data-testid="notification-item"
                className={cn("flex items-start gap-3 px-4 py-4", !n.read && "bg-accent/50")}
              >
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    n.read ? "bg-transparent" : "bg-primary",
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="font-medium">{n.title ?? n.message}</p>
                    <p className="text-xs text-muted-foreground">{absoluteTime(n.createdAt)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  {property && (
                    <Link
                      href="/properties"
                      className="inline-block text-xs font-medium text-primary hover:underline"
                    >
                      {property.address}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Notifications — Homie</title>
      </Head>
      <AppShell>
        <NotificationsContent />
      </AppShell>
    </ProtectedRoute>
  );
}
