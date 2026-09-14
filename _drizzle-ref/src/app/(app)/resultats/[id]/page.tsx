import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { Download, ArrowRight } from "lucide-react";
import { db } from "@/db";
import { results, documents } from "@/db/schema";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { ResultActions } from "@/components/app/actions";
import { Markdown } from "@/components/app/markdown";
import { requireUser } from "@/lib/auth/guards";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Résultat" };

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireUser(`/resultats/${id}`);

  const rows = await db
    .select()
    .from(results)
    .where(and(eq(results.id, id), eq(results.userId, session.id)))
    .limit(1);
  const result = rows[0];
  if (!result) notFound();

  const docs = await db.select().from(documents).where(eq(documents.resultId, result.id));
  const answers = (result.content?.answers ?? null) as Record<string, unknown> | null;
  const labels = (result.content?.labels ?? {}) as Record<string, string>;

  return (
    <PageTransition className="mx-auto max-w-3xl space-y-6">
      <Breadcrumb
        items={[{ label: "Mes résultats", href: "/resultats" }, { label: result.title }]}
      />

      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Badge tone={result.type === "pathway" ? "or" : "outline"}>
            {result.type === "pathway" ? "Livrable de parcours" : "Résultat de mission"}
          </Badge>
          <h1 className="mt-3 font-display text-2xl leading-tight text-ivoire">{result.title}</h1>
          <p className="mt-2 text-sm text-ivoire-dim">{result.summary}</p>
          <p className="mt-2 text-xs text-ivoire-faint">Créé le {formatDate(result.createdAt)}</p>
        </div>
        <ResultActions id={result.id} pinned={result.isPinned} />
      </header>

      {docs.map((doc) => (
        <Card key={doc.id}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <CardTitle className="text-base">{doc.title}</CardTitle>
            <a href={`/api/documents/${doc.id}`} download>
              <Button variant="secondary" size="sm" icon={<Download size={15} />}>
                Télécharger
              </Button>
            </a>
          </div>
          {doc.body && <Markdown content={doc.body} />}
        </Card>
      ))}

      {answers && Object.keys(answers).length > 0 && (
        <Card>
          <CardTitle className="text-base">Tes réponses</CardTitle>
          <dl className="mt-4 space-y-4">
            {Object.entries(answers).map(([key, value]) => (
              <div key={key} className="border-l-2 border-or/30 pl-4">
                <dt className="text-xs uppercase tracking-wider text-ivoire-faint">
                  {labels[key] ?? key}
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ivoire">
                  {Array.isArray(value) ? value.join(", ") : String(value ?? "—")}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      )}

      {result.pathwayId && (
        <Link href="/resultats">
          <Button variant="ghost" iconRight={<ArrowRight size={16} />}>
            Retour à mes résultats
          </Button>
        </Link>
      )}
    </PageTransition>
  );
}
