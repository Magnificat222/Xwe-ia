import type { Metadata } from "next";
import { Swords } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeading, Stat } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { DataTable, type Column } from "@/components/admin/data-table";
import { requireRole } from "@/lib/auth/guards";
import { getAdminGames } from "@/lib/queries/admin";
import { getLeaderboard } from "@/lib/queries/arena";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/misc";
import { LEVEL_LABELS } from "@/lib/utils";
import { resolveIcon } from "@/lib/icons";

export const metadata: Metadata = { title: "Arène" };

type Row = Awaited<ReturnType<typeof getAdminGames>>[number];

export default async function AdminArenaPage() {
  await requireRole("admin", "/admin/arene");
  const [games, leaderboard] = await Promise.all([getAdminGames(), getLeaderboard(10)]);

  const columns: Column<Row>[] = [
    {
      key: "title",
      header: "Jeu",
      render: (row) => {
        const Icon = resolveIcon(row.icon, Swords);
        return (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-braise/12 text-braise-vif">
              <Icon size={16} strokeWidth={1.6} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-ivoire">{row.title}</p>
              <p className="line-clamp-1 text-xs text-ivoire-faint">{row.description}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "level",
      header: "Niveau",
      render: (row) => <Badge tone="outline">{LEVEL_LABELS[row.level]}</Badge>,
    },
    {
      key: "access",
      header: "Accès",
      render: (row) => (
        <Badge tone={row.accessType === "free" ? "feuillage" : "or"}>{row.accessType}</Badge>
      ),
    },
    {
      key: "state",
      header: "État",
      render: (row) => (
        <Badge tone={row.isPublished ? "feuillage" : "outline"}>
          {row.isPublished ? "Publié" : "Masqué"}
        </Badge>
      ),
    },
  ];

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-7">
      <SectionHeading
        eyebrow="Contenu"
        title="Arène"
        description="Les jeux et le classement des membres."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Jeux" value={games.length} tone="braise" />
        <Stat label="Publiés" value={games.filter((g) => g.isPublished).length} tone="feuillage" />
        <Stat label="Joueurs classés" value={leaderboard.length} tone="or" />
      </div>

      <DataTable columns={columns} rows={games} empty="Aucun jeu." title={(row) => row.title} />

      <section>
        <h2 className="mb-4 font-display text-lg text-ivoire">Classement</h2>
        <Card className="p-0">
          {leaderboard.length === 0 ? (
            <p className="px-4 py-5 text-sm text-ivoire-dim">Aucun score enregistré.</p>
          ) : (
            <ol>
              {leaderboard.map((entry) => (
                <li
                  key={entry.userId}
                  className="flex items-center gap-3 border-b border-ivoire/6 px-4 py-3 last:border-0"
                >
                  <span className="w-6 shrink-0 font-mono text-xs text-ivoire-faint">
                    {entry.rank}
                  </span>
                  <Avatar name={entry.name} src={entry.avatarUrl} size={30} />
                  <span className="min-w-0 flex-1 truncate text-sm text-ivoire">{entry.name}</span>
                  <span className="shrink-0 font-mono text-sm text-or">{entry.points}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </section>
    </PageTransition>
  );
}
