"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface CategoryOption {
  slug: string;
  name: string;
  description: string;
  icon: string;
}

interface MissionPreview {
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
}

export function OnboardingFlow({
  categories,
  missions,
}: {
  categories: CategoryOption[];
  missions: MissionPreview[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const recommended = missions.filter((m) => m.categorySlug === selected).slice(0, 3);

  if (!selected) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((cat) => {
          const Icon = (Icons[cat.icon as keyof typeof Icons] as Icons.LucideIcon) ?? Icons.Sparkles;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setSelected(cat.slug)}
              className="flex items-start gap-3 rounded-xl border border-ivoire/10 bg-noir-elevated p-4 text-left transition-colors hover:border-or/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-or/10 text-or">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm text-ivoire">{cat.name}</p>
                <p className="mt-0.5 text-xs text-ivoire-dim">{cat.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setSelected(null)}
        className="mb-4 text-xs text-ivoire-dim hover:text-or"
      >
        ← Choisir un autre objectif
      </button>

      <div className="space-y-3">
        {recommended.map((mission) => (
          <Link key={mission.slug} href={`/missions/${mission.slug}`}>
            <Card className="transition-colors hover:border-or/30">
              <p className="font-display text-base text-ivoire">{mission.title}</p>
              <p className="mt-1 text-sm text-ivoire-dim">{mission.description}</p>
            </Card>
          </Link>
        ))}
        {recommended.length === 0 && (
          <p className="text-sm text-ivoire-dim">
            Pas de mission gratuite dans cette catégorie pour l'instant — direction le tableau de bord.
          </p>
        )}
      </div>

      <div className="mt-6">
        <Button onClick={() => router.push("/dashboard")}>
          Aller à mon tableau de bord <ArrowRight size={15} />
        </Button>
      </div>
    </div>
  );
}
