import { useEffect } from "react";
import { useRouter } from "next/router";

import { useApp } from "@/context/AppContext";

export default function IndexPage() {
  const router = useRouter();
  const { user, authReady } = useApp();

  useEffect(() => {
    if (!authReady) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [authReady, user, router]);

  return null;
}
