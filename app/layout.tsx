import type { Metadata } from "next";
import { Unbounded, Inter, IBM_Plex_Mono, Atkinson_Hyperlegible, Bricolage_Grotesque } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

// Display face: bold, geometric, contemporary — deliberately NOT a serif.
// A serif headline reads as "classic/literary"; Unbounded reads as current
// and confident instead, closer to the energy of African tech branding
// than an editorial magazine.
const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

// Alternate reading fonts, offered as a personal preference in Settings.
// All loaded upfront (bound to their own CSS variables) so switching is an
// instant class toggle with no extra network request or layout flash.
const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body-atkinson",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-body-bricolage",
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
      className={`${unbounded.variable} ${inter.variable} ${atkinson.variable} ${bricolage.variable} ${plexMono.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
