import { useRouter } from "next/router";
import { Home, LogOut } from "lucide-react";

import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logOut } = useApp();

  const handleLogout = () => {
    logOut();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Home className="h-4 w-4" />
            </div>
            Homie
          </div>
          <div className="flex items-center gap-1">
            <span className="mr-2 hidden text-sm text-muted-foreground sm:inline">
              {user}
            </span>
            <NotificationBell />
            <DarkModeToggle />
            <Button variant="ghost" size="icon" aria-label="Log out" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
