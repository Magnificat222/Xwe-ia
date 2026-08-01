import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DuelsList } from "@/components/quiz/duels-list";
import { ArrowLeft } from "lucide-react";

export default async function QuizDuelsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/quiz/duels");

  const duels = await prisma.duel.findMany({
    where: {
      OR: [{ challengerId: session.user.id }, { opponentId: session.user.id }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      stage: { select: { title: true, slug: true } },
      challenger: { select: { id: true, name: true, email: true } },
      opponent: { select: { id: true, name: true, email: true } },
      challengerAttempt: { select: { totalScore: true, completedAt: true } },
      opponentAttempt: { select: { totalScore: true, completedAt: true } },
    },
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/quiz"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim transition-colors hover:text-or"
      >
        <ArrowLeft size={15} /> Retour à l'arène
      </Link>

      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Duels</p>
        <h1 className="mt-2 font-display text-3xl text-ivoire">Mes défis</h1>
      </div>

      <DuelsList
        duels={JSON.parse(JSON.stringify(duels))}
        myUserId={session.user.id}
      />
    </main>
  );
}
