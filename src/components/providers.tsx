"use client";

import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { ToastProvider } from "@/components/ui/toast";

/** Applique la police de lecture choisie dans les Paramètres. */
function FontPreference({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const pref = localStorage.getItem("xwe-font-pref");
    document.documentElement.classList.remove("font-pref-atkinson", "font-pref-bricolage");
    if (pref === "atkinson" || pref === "bricolage") {
      document.documentElement.classList.add(`font-pref-${pref}`);
    }
  }, []);
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <FontPreference>
        <ToastProvider>{children}</ToastProvider>
      </FontPreference>
    </ThemeProvider>
  );
}
