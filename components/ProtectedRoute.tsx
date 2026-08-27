import { useEffect } from "react";
import { useRouter } from "next/router";

import { useApp } from "@/context/AppContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, authReady } = useApp();

  useEffect(() => {
    if (authReady && !user) {
      router.replace("/login");
    }
  }, [authReady, user, router]);

  if (!authReady || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
