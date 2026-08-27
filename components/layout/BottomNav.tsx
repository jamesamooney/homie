import Link from "next/link";
import { useRouter } from "next/router";
import { Home, Building2, CalendarClock, Bell } from "lucide-react";

import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/schedule", label: "Schedule", icon: CalendarClock },
  { href: "/notifications", label: "Alerts", icon: Bell },
] as const;

export function BottomNav() {
  const router = useRouter();
  const { unreadCount } = useApp();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:hidden"
      aria-label="Primary"
    >
      <div className="flex h-16 items-stretch justify-around">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = router.pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-colors",
                active && "text-primary",
              )}
            >
              <span className="relative">
                <Icon className="h-5 w-5" fill={active ? "currentColor" : "none"} />
                {label === "Alerts" && unreadCount > 0 && (
                  <span
                    data-testid="bottom-nav-unread-badge"
                    className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
