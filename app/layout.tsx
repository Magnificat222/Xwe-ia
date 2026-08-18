import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono, Atkinson_Hyperlegible, Lora } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

// Alternate reading fonts, offered as a personal preference in Settings.
// Both loaded upfront (bound to their own CSS variables) so switching is an
// instant class toggle with no extra network request or layout flash.
const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body-atkinson",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-body-lora",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Xwé IA — L'IA au service de vos objectifs",
  description:
    "Xwé IA transforme vos objectifs en missions guidées : business plan, lancement d'entreprise, soutenance, personal branding et plus, avec l'IA comme copilote.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${inter.variable} ${atkinson.variable} ${lora.variable} ${plexMono.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
