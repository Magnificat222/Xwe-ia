import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { MissionPlayer } from "@/components/app/mission-player";
import { requireUser } from "@/lib/auth/guards";
import { getMissionBySlug } from "@/lib/queries/catalogue";
import { getMissionResponse } from "@/lib/queries/progress";
import { resolveAccess } from "@/lib/access";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mission = await getMissionBySlug(slug);
  return { title: mission?.title ?? "Mission" };
}

export default async function MissionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await requireUser(`/missions/${slug}`);
  const mission = await getMissionBySlug(slug);
  if (!mission || !mission.isPublished) notFound();

  const access = await resolveAccess(session, {
    id: mission.pathway.id,
    accessType: mission.pathway.accessType,
    priceXof: mission.pathway.priceXof,
  });

  if (!access.allowed) {
    return (
      <PageTransition className="mx-auto max-w-2xl">
        <Card tone="braise" className="text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-or/12 text-or">
            <Lock size={24} />
          </span>
          <CardTitle>Cette mission n'est pas encore ouverte</CardTitle>
          <CardDescription>
            Elle fait partie du parcours « {mission.pathway.title} ».
          </CardDescription>
          <div className="mt-5 flex justify-center gap-2.5">
            <Link href={`/parcours/${mission.pathway.slug}`}>
              <Button>Voir le parcours</Button>
            </Link>
            <Link href="/premium">
              <Button variant="secondary">Découvrir Premium</Button>
            </Link>
          </div>
        </Card>
      </PageTransition>
    );
  }

  const response = await getMissionResponse(session.id, mission.id);

  return (
    <PageTransition className="mx-auto max-w-6xl">
      <Breadcrumb
        items={[
          { label: "Parcours", href: "/parcours" },
          { label: mission.pathway.title, href: `/parcours/${mission.pathway.slug}` },
          { label: mission.title },
        ]}
      />
      <div className="mt-5">
        <MissionPlayer
          mission={{
            slug: mission.slug,
            title: mission.title,
            objective: mission.objective,
            explanation: mission.explanation,
            instructions: mission.instructions ?? [],
            fields: mission.fields ?? [],
            prompts: mission.prompts ?? [],
            tips: mission.tips ?? [],
            pitfalls: mission.pitfalls ?? [],
            checklist: mission.checklist ?? [],
            resultLabel: mission.resultLabel,
            aiAssist: mission.aiAssist,
          }}
          initialAnswers={(response?.answers as Record<string, unknown>) ?? {}}
          initialChecked={response?.checkedItems ?? []}
          alreadyCompleted={Boolean(response?.submittedAt)}
          pathwaySlug={mission.pathway.slug}
          nextSlug={mission.next?.slug ?? null}
          previousSlug={mission.previous?.slug ?? null}
          index={mission.index}
          total={mission.total}
        />
      </div>
    </PageTransition>
  );
}
