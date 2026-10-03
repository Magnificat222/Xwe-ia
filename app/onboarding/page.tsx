import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingFlow } from "@/components/shared/onboarding-flow";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [categories, missions] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.mission.findMany({
      where: { isPublished: true, isPremium: false },
      select: { slug: true, title: true, description: true, category: { select: { slug: true } } },
      take: 60,
    }),
  ]);

  const missionPreviews = missions.map((m) => ({
    slug: m.slug,
    title: m.title,
    description: m.description,
    categorySlug: m.category.slug,
  }));

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Bienvenue</p>
      <h1 className="mt-2 font-display text-3xl text-ivoire">Quel est votre objectif principal ?</h1>
      <p className="mt-2 text-sm text-ivoire-dim">
        Ça nous aide à vous proposer une première mission pertinente. Vous pourrez explorer le reste ensuite.
      </p>

      <div className="mt-8">
        <OnboardingFlow categories={categories} missions={missionPreviews} />
      </div>

      <Link href="/dashboard" className="mt-8 inline-block text-xs text-ivoire-dim hover:text-or">
        Passer cette étape
      </Link>
    </main>
  );
}
