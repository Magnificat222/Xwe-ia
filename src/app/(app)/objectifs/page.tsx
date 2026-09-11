import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Target,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/misc";
import { Stagger, StaggerItem, PageTransition } from "@/components/motion";
import { getGoals } from "@/lib/queries/catalogue";
import { getSession } from "@/lib/auth/session";
import { getCurrentGoal } from "@/lib/queries/progress";
import { resolveIcon } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Objectifs",
  description: "Choisis ce que tu veux accomplir : Xwé IA construit le chemin qui y mène.",
};

export const revalidate = 300;

export default async function GoalsPage() {
  const session = await getSession();
  const [goals, current] = await Promise.all([
    getGoals(),
    session ? getCurrentGoal(session.id) : Promise.resolve(null),
  ]);

  return (
    <PageTransition className="mx-auto max-w-5xl">
      <SectionHeading
        eyebrow="Que veux-tu accomplir ?"
        title="Choisis ton objectif"
        description="Chaque objectif ouvre les parcours qui y mènent. Tu peux en changer à tout moment."
      />

      <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const Icon = resolveIcon(goal.icon, Target);
          const isCurrent = current?.id === goal.id;
          return (
            <StaggerItem key={goal.id}>
              <Link href={`/objectifs/${goal.slug}`} className="block h-full">
                <Card interactive tone={isCurrent ? "or" : "default"} className="h-full">
                  <div className="mb-3.5 flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-or/10 text-or">
                      <Icon size={20} strokeWidth={1.6} />
                    </span>
                    {isCurrent && <Badge tone="or">Objectif actuel</Badge>}
                  </div>
                  <CardTitle className="text-base leading-snug">{goal.title}</CardTitle>
                  <CardDescription>{goal.tagline}</CardDescription>
                  <p className="mt-3.5 flex items-center gap-1.5 text-xs text-or">
                    {goal.pathwayCount} parcours <ArrowRight size={13} />
                  </p>
                </Card>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </PageTransition>
  );
}
