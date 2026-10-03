import Link from "next/link";
import { learningPaths } from "@/lib/data/paths";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Lock } from "lucide-react";

export function PathsShowcase() {
  return (
    <section id="parcours" className="border-y border-ivoire/10 bg-noir-soft/40 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-lg">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Parcours</p>
          <h2 className="mt-3 font-display text-3xl text-ivoire">
            Des parcours complets, pas des astuces isolées
          </h2>
          <p className="mt-3 text-sm text-ivoire-dim">
            Chaque parcours enchaîne plusieurs missions pour vous amener d'un objectif flou à un résultat concret.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[...learningPaths]
            .sort((a, b) => Number(a.isPremium) - Number(b.isPremium))
            .map((path) => (
            <Link key={path.id} href={`/parcours/${path.slug}`}>
              <Card className="flex h-full flex-col justify-between transition-colors hover:border-or/30">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    {path.isPremium ? (
                      <Badge tone="gold" className="gap-1">
                        <Lock size={11} /> Premium
                      </Badge>
                    ) : (
                      <Badge>Gratuit</Badge>
                    )}
                    <span className="text-xs text-ivoire-dim">
                      {path.missionIds.length} mission{path.missionIds.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <h3 className="font-display text-lg text-ivoire">{path.title}</h3>
                  <p className="mt-2 text-sm text-ivoire-dim">{path.description}</p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-sm text-or">
                  Découvrir le parcours <ArrowUpRight size={14} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
