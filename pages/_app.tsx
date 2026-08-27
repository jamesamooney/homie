import type { AppProps } from "next/app";
import { Hanken_Grotesk, Inter } from "next/font/google";
import { Toaster } from "sonner";

import { AppProvider } from "@/context/AppContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppProvider>
      <TooltipProvider delayDuration={150}>
        <div className={`${inter.variable} ${hankenGrotesk.variable} font-sans`}>
          <Component {...pageProps} />
        </div>
        <Toaster
          position="bottom-right"
          mobileOffset={{ bottom: "88px" }}
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
