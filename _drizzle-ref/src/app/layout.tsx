import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import "./fonts.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Xwé IA — Transforme tes idées en résultats concrets",
    template: "%s · Xwé IA",
  },
  description:
    "Xwé IA t'accompagne étape par étape pour apprendre, construire et accomplir tes objectifs avec l'aide de l'intelligence artificielle.",
  keywords: ["IA", "objectifs", "business plan", "parcours", "missions", "Bénin", "Afrique"],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Xwé IA",
    title: "Xwé IA — Transforme tes idées en résultats concrets",
    description:
      "Une idée en tête ? Transformons-la en projet. Objectif, parcours, missions, résultat.",
  },
  icons: { icon: "/logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#100d0a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-or focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-noir"
        >
          Aller au contenu principal
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
