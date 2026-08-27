import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { LogOut } from "lucide-react";

import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { BottomNav } from "@/components/layout/BottomNav";

const NAV_LINKS = [
  { href: "/properties", label: "Properties" },
  { href: "/schedule", label: "Schedule" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logOut } = useApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logOut();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header
        className={cn(
          "sticky top-0 z-40 border-b bg-background/95 backdrop-blur transition-shadow duration-200 supports-[backdrop-filter]:bg-background/60",
          scrolled && "shadow-md",
        )}
      >
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Image src="/logo.png" width={32} height={32} alt="Homie" priority className="rounded-lg" />
              Homie
            </Link>
            <nav className="hidden items-center gap-4 sm:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                    router.pathname === link.href && "text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <span className="mr-2 hidden text-sm text-muted-foreground sm:inline">
              {user}
            </span>
            <span className="hidden sm:inline-flex">
              <NotificationBell />
            </span>
            <DarkModeToggle />
            <Button variant="ghost" size="icon" aria-label="Log out" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="container py-8 pb-24 sm:pb-8">{children}</main>
      <BottomNav />
    </div>
  );
}
