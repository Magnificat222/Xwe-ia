import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMinutes } from "@/lib/utils";
import { CheckCircle2, Lightbulb, AlertTriangle, Clock, Lock, ArrowLeft } from "lucide-react";
import type { MissionStep } from "@/types";
import { FavoriteMissionButton } from "@/components/missions/favorite-mission-button";
import { CompleteMissionButton } from "@/components/missions/complete-mission-button";

export default async function MissionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mission = await prisma.mission.findUnique({ where: { slug } });
  if (!mission) notFound();

  const session = await auth();

  let isPremiumUser = false;
  if (session?.user?.id) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });
    isPremiumUser = subscription?.plan === "PREMIUM";

    // Fire-and-forget: log this view in History without blocking the render.
    prisma.history
      .create({ data: { userId: session.user.id, missionId: mission.id } })
      .catch(() => {});
  }

  const locked = mission.isPremium && !isPremiumUser;

  if (locked) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <Link
          href="/missions"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim transition-colors hover:text-or"
        >
          <ArrowLeft size={15} /> Retour aux missions
        </Link>
        <div className="mb-3 flex items-center justify-center gap-2">
          <Badge>{mission.level.toLowerCase()}</Badge>
          <Badge tone="gold">Premium</Badge>
        </div>
        <h1 className="font-display text-3xl text-ivoire">{mission.title}</h1>
        <p className="mt-3 text-ivoire-dim">{mission.description}</p>

        <div className="mx-auto mt-8 max-w-md rounded-card border border-or/30 bg-noir-soft p-8">
          <Lock className="mx-auto mb-4 text-or" size={28} />
          <p className="font-display text-lg text-ivoire">Mission réservée aux membres Premium</p>
          <p className="mt-2 text-sm text-ivoire-dim">
            Passez Premium pour débloquer les étapes détaillées, les conseils
            et la checklist complète de cette mission.
          </p>
          <a href="/#tarifs" className="mt-5 inline-block">
            <Button size="lg">Voir les offres Premium</Button>
          </a>
        </div>
      </main>
    );
  }

  const steps = mission.steps as unknown as MissionStep[];

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/missions"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim transition-colors hover:text-or"
      >
        <ArrowLeft size={15} /> Retour aux missions
      </Link>
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <Badge>{mission.level.toLowerCase()}</Badge>
          {mission.isPremium && <Badge tone="gold">Premium</Badge>}
        </div>
        <h1 className="font-display text-3xl text-ivoire">{mission.title}</h1>
        <p className="mt-3 text-ivoire-dim">{mission.description}</p>
        <p className="mt-4 flex items-center gap-1.5 text-sm text-ivoire-dim">
          <Clock size={14} /> {formatMinutes(mission.estimatedMinutes)}
        </p>
      </div>

      <section className="mb-10 space-y-6">
        <h2 className="font-display text-xl text-ivoire">Étapes</h2>
        {steps.map((step, i) => (
          <div key={step.id} className="rounded-card border border-ivoire/10 bg-noir-soft p-5">
            <p className="font-mono text-xs text-or">Étape {i + 1}</p>
            <p className="mt-1 font-display text-base text-ivoire">{step.title}</p>
            <p className="mt-1.5 text-sm text-ivoire-dim">{step.content}</p>
          </div>
        ))}
      </section>

      <section className="mb-10 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg text-ivoire">
            <Lightbulb size={18} className="text-or" /> Conseils
          </h3>
          <ul className="space-y-2 text-sm text-ivoire-dim">
            {mission.tips.map((tip) => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg text-ivoire">
            <AlertTriangle size={18} className="text-or" /> Erreurs à éviter
          </h3>
          <ul className="space-y-2 text-sm text-ivoire-dim">
            {mission.commonMistakes.map((mistake) => (
              <li key={mistake}>• {mistake}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-10">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg text-ivoire">
          <CheckCircle2 size={18} className="text-or" /> Checklist finale
        </h3>
        <ul className="space-y-2">
          {mission.checklist.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-ivoire">
              <input type="checkbox" className="h-4 w-4 accent-[--color-or]" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <CompleteMissionButton missionId={mission.id} />
        <FavoriteMissionButton missionId={mission.id} />
      </div>
    </main>
  );
}
