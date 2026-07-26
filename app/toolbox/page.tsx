import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ListChecks } from "lucide-react";

export default async function ToolboxPage() {
  const tools = await prisma.tool.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">AI Toolbox</p>
        <h1 className="mt-2 font-display text-3xl text-ivoire">Les meilleurs outils IA</h1>
      </div>

      {tools.length === 0 && (
        <p className="text-sm text-ivoire-dim">
          Aucun outil publié pour l'instant — lance `npm run db:seed`.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((tool) => (
          <Card key={tool.id}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-display text-lg text-ivoire">{tool.name}</h3>
              <span className="text-xs text-ivoire-dim">{tool.pricing}</span>
            </div>
            <p className="text-sm text-ivoire-dim">{tool.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tool.useCases.map((useCase) => (
                <Badge key={useCase}>{useCase}</Badge>
              ))}
            </div>

            {tool.howToUse.length > 0 && (
              <div className="mt-4 rounded-lg bg-noir p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-or">
                  <ListChecks size={13} /> Comment l'utiliser
                </p>
                <ol className="space-y-1.5">
                  {tool.howToUse.map((step, i) => (
                    <li key={i} className="flex gap-2 text-xs text-ivoire-dim">
                      <span className="text-or">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-or hover:underline"
            >
              Visiter le site <ExternalLink size={13} />
            </a>
          </Card>
        ))}
      </div>
    </main>
  );
}
