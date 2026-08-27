import type { AppProps } from "next/app";
import { Toaster } from "sonner";

import { AppProvider } from "@/context/AppContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppProvider>
      <TooltipProvider delayDuration={150}>
        <Component {...pageProps} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "!bg-foreground !text-background !border-none !shadow-lg",
              description: "!text-background/80",
              actionButton: "!bg-background !text-foreground",
              cancelButton: "!bg-background/20 !text-background",
            },
          }}
        />
      </TooltipProvider>
    </AppProvider>
  );
}
