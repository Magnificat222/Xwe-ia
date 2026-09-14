import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/app/onboarding";
import { Logo } from "@/components/layout/brand";
import { requireUser } from "@/lib/auth/guards";
import { getGoals } from "@/lib/queries/catalogue";

export const metadata: Metadata = { title: "Bienvenue" };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ suite?: string }>;
}) {
  const session = await requireUser("/bienvenue");
  const { suite } = await searchParams;
  const safeSuite = suite?.startsWith("/") && !suite.startsWith("//") ? suite : undefined;

  if (session.onboarded) redirect(safeSuite ?? "/tableau-de-bord");

  const goals = await getGoals();

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="halo-braise pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <header className="px-5 py-5 sm:px-8">
        <Logo href={null} />
      </header>
      <main id="contenu" className="flex flex-1 items-start justify-center px-5 py-8 sm:items-center sm:px-6">
        <OnboardingFlow
          goals={goals.map((g) => ({
            id: g.id,
            slug: g.slug,
            title: g.title,
            tagline: g.tagline,
            icon: g.icon,
          }))}
          defaultName={session.name ?? ""}
          suite={safeSuite}
        />
      </main>
    </div>
  );
}
