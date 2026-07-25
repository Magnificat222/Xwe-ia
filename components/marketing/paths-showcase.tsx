import { learningPaths } from "@/lib/data/paths";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";

export function PathsShowcase() {
  return (
    <section id="parcours" className="border-y border-ivoire/10 bg-noir-soft/40 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-lg">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Parcours</p>
          <h2 className="mt-3 font-display text-3xl text-ivoire">
            Des parcours complets, pas des astuces isolées
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {learningPaths.map((path) => (
            <Card key={path.id} className="flex flex-col justify-between">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  {path.isPremium ? (
                    <Badge tone="gold">Premium</Badge>
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
          ))}
        </div>
      </div>
    </section>
  );
}
