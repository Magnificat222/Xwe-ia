"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { FontPrefProvider } from "@/components/shared/font-pref-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <FontPrefProvider>
        <SessionProvider>{children}</SessionProvider>
      </FontPrefProvider>
    </ThemeProvider>
  );
}
