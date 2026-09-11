import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Trophy, Pin, FolderOpen, Star, Clock } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stat, EmptyState, SectionHeading } from "@/components/ui/misc";
import { Stagger, StaggerItem, PageTransition } from "@/components/motion";
import { requireUser } from "@/lib/auth/guards";
import {
  getUserResults,
  getUserDocuments,
  getUserPathways,
  getDashboardStats,
} from "@/lib/queries/progress";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Mes résultats" };

const TYPE_LABELS: Record<string, string> = {
  mission: "Mission",
  pathway: "Parcours",
  document: "Document",
  project: "Projet",
};

export default async function ResultsPage() {
  const session = await requireUser("/resultats");
  const [results, documents, myPathways, stats] = await Promise.all([
    getUserResults(session.id),
    getUserDocuments(session.id),
    getUserPathways(session.id),
    getDashboardStats(session.id),
  ]);

  const pinned = results.filter((r) => r.isPinned);
  const others = results.filter((r) => !r.isPinned);
  const finished = myPathways.filter((p) => p.status === "completed");

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-8">
      <SectionHeading
        eyebrow="Ton espace"
        title="Mes résultats"
        description="Tout ce que tu as produit avec Xwé IA : livrables, documents et parcours terminés."
      />

      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StaggerItem>
          <Stat label="Résultats" value={stats.results} icon={<Trophy size={19} />} tone="or" />
        </StaggerItem>
        <StaggerItem>
          <Stat label="Documents" value={documents.length} icon={<FileText size={19} />} tone="braise" />
        </StaggerItem>
        <StaggerItem>
          <Stat
            label="Parcours terminés"
            value={stats.pathwaysCompleted}
            icon={<FolderOpen size={19} />}
            tone="feuillage"
          />
        </StaggerItem>
        <StaggerItem>
          <Stat label="Missions" value={stats.missionsCompleted} icon={<Star size={19} />} tone="or" />
        </StaggerItem>
      </Stagger>

      {results.length === 0 ? (
        <EmptyState
          icon={<Trophy size={22} />}
          title="Ton espace est encore vide"
          description="Termine ta première mission : ton travail sera automatiquement enregistré ici."
          action={
            <Link href="/parcours">
              <Button>Choisir un parcours</Button>
            </Link>
          }
        />
      ) : (
        <>
          {pinned.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg text-ivoire">
                <Pin size={17} className="text-or" /> Épinglés
              </h2>
              <Stagger className="grid gap-3 sm:grid-cols-2">
                {pinned.map((result) => (
                  <StaggerItem key={result.id}>
                    <ResultCard result={result} />
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          )}

          <section>
            <h2 className="mb-4 font-display text-lg text-ivoire">
              {pinned.length > 0 ? "Tous tes résultats" : "Tes résultats"}
            </h2>
            <Stagger className="grid gap-3 sm:grid-cols-2">
              {others.map((result) => (
                <StaggerItem key={result.id}>
                  <ResultCard result={result} />
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        </>
      )}

      {finished.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg text-ivoire">Parcours terminés</h2>
          <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {finished.map((item) => (
              <StaggerItem key={item.id}>
                <Link href={`/parcours/${item.pathway.slug}`}>
                  <Card interactive className="h-full">
                    <Badge tone="feuillage">Terminé</Badge>
                    <CardTitle className="mt-3 text-sm leading-snug">{item.pathway.title}</CardTitle>
                    <p className="mt-2 text-xs text-ivoire-faint">
                      {item.totalCount} missions · {formatRelative(item.completedAt)}
                    </p>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}
    </PageTransition>
  );
}

function ResultCard({
  result,
}: {
  result: {
    id: string;
    type: string;
    title: string;
    summary: string;
    createdAt: Date;
    isPinned: boolean;
    pathway: { title: string } | null;
  };
}) {
  return (
    <Link href={`/resultats/${result.id}`} className="block h-full">
      <Card interactive className="h-full">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <Badge tone={result.type === "pathway" ? "or" : "outline"}>
            {TYPE_LABELS[result.type] ?? result.type}
          </Badge>
          {result.isPinned && <Pin size={13} className="text-or" fill="currentColor" />}
        </div>
        <CardTitle className="text-sm leading-snug">{result.title}</CardTitle>
        {result.summary && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ivoire-dim">
            {result.summary}
          </p>
        )}
        <p className="mt-3 flex items-center gap-3 text-[0.7rem] text-ivoire-faint">
          <span className="flex items-center gap-1">
            <Clock size={11} /> {formatRelative(result.createdAt)}
          </span>
          {result.pathway && <span className="truncate">{result.pathway.title}</span>}
        </p>
      </Card>
    </Link>
  );
}
