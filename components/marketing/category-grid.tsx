import * as Icons from "lucide-react";
import { categories } from "@/lib/data/categories";
import { Card } from "@/components/ui/card";

export function CategoryGrid() {
  return (
    <section id="missions" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 max-w-lg">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Mission center</p>
        <h2 className="mt-3 font-display text-3xl text-ivoire">
          Neuf catégories, des missions concrètes
        </h2>
        <p className="mt-3 text-ivoire-dim">
          Chaque mission détaille des étapes, des prompts optimisés, des
          conseils et une checklist finale.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = (Icons[category.icon as keyof typeof Icons] ??
            Icons.Sparkles) as Icons.LucideIcon;
          return (
            <Card key={category.id} className="group">
              <Icon className="mb-4 text-or" size={24} strokeWidth={1.5} />
              <h3 className="font-display text-lg text-ivoire">{category.name}</h3>
              <p className="mt-1.5 text-sm text-ivoire-dim">{category.description}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
