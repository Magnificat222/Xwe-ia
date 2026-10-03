import Link from "next/link";
import * as Icons from "lucide-react";
import { categories } from "@/lib/data/categories";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

// Framed as "what do you want to accomplish" rather than a content
// catalogue — the goal (per Xwé IA's positioning) is that people start
// from an objective, not from a list of prompts to browse.
const OBJECTIVE_LABELS: Record<string, string> = {
  business: "Développer mon activité",
  marketing: "Développer mon marketing",
  etudes: "Réussir mes études",
  creation: "Créer un document ou un contenu",
  productivite: "Gagner en productivité",
  developpement: "Avancer sur un projet technique",
  ia: "Mieux utiliser l'IA au quotidien",
  automatisation: "Automatiser une tâche",
  "gestion-de-projet": "Lancer et piloter mon projet",
};

export function CategoryGrid() {
  return (
    <section id="missions" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 max-w-lg">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Par où commencer</p>
        <h2 className="mt-3 font-display text-3xl text-ivoire">
          Que voulez-vous accomplir ?
        </h2>
        <p className="mt-3 text-ivoire-dim">
          Choisissez votre objectif — Xwé IA vous propose des missions
          concrètes pour y arriver, étape par étape.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = (Icons[category.icon as keyof typeof Icons] ??
            Icons.Sparkles) as Icons.LucideIcon;
          return (
            <Link key={category.id} href={`/missions?categorie=${category.slug}`}>
              <Card className="group h-full transition-colors hover:border-or/30">
                <Icon className="mb-4 text-or" size={24} strokeWidth={1.5} />
                <h3 className="font-display text-lg text-ivoire">
                  {OBJECTIVE_LABELS[category.slug] ?? category.name}
                </h3>
                <p className="mt-1.5 text-sm text-ivoire-dim">{category.description}</p>
                <p className="mt-4 flex items-center gap-1.5 text-sm text-or opacity-0 transition-opacity group-hover:opacity-100">
                  Voir les missions <ArrowRight size={14} />
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
