import type { Metadata } from "next";
import Link from "next/link";
import { Swords, Trophy, Medal, Target, Flame } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, Stat, SectionHeading, EmptyState } from "@/components/ui/misc";
import { PageTransition, Stagger, StaggerItem } from "@/components/motion";
import { getGames, getLeaderboard, getUserArenaStats, getUserAttempts } from "@/lib/queries/arena";
import { getSession } from "@/lib/auth/session";
import { formatRelative, LEVEL_LABELS, cn } from "@/lib/utils";
import { resolveIcon } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Arène",
  description: "Teste tes connaissances, gagne des points, grimpe au classement.",
};

export default async function ArenaPage() {
  const session = await getSession();
  const [games, leaderboard, stats, attempts] = await Promise.all([
    getGames(),
    getLeaderboard(10),
    session ? getUserArenaStats(session.id) : Promise.resolve(null),
    session ? getUserAttempts(session.id, 5) : Promise.resolve([]),
  ]);

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-9">
      <SectionHeading
        eyebrow="L'arène"
        title="Apprendre en jouant"
        description="Des défis courts pour ancrer ce que tu apprends. Chaque bonne réponse rapporte des points."
      />

      {stats && (
        <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StaggerItem>
            <Stat label="Tes points" value={stats.points} icon={<Trophy size={19} />} tone="or" />
          </StaggerItem>
          <StaggerItem>
            <Stat
              label="Classement"
              value={stats.rank ? `#${stats.rank}` : "—"}
              icon={<Medal size={19} />}
              tone="braise"
            />
          </StaggerItem>
          <StaggerItem>
            <Stat label="Meilleur score" value={stats.best} icon={<Flame size={19} />} tone="feuillage" />
          </StaggerItem>
          <StaggerItem>
            <Stat label="Défis joués" value={stats.attempts} icon={<Target size={19} />} tone="or" />
          </StaggerItem>
        </Stagger>
      )}

      <section>
        <h2 className="mb-5 font-display text-lg text-ivoire">Les jeux</h2>
        {games.length === 0 ? (
          <EmptyState
            icon={<Swords size={22} />}
            title="L'arène ouvre bientôt"
            description="Les premiers défis arrivent très prochainement."
          />
        ) : (
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => {
              const Icon = resolveIcon(game.icon, Swords);
              return (
                <StaggerItem key={game.id}>
                  <Link href={`/arene/${game.slug}`} className="block h-full">
                    <Card interactive className="flex h-full flex-col">
                      <div className="mb-3.5 flex items-start justify-between gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-braise/12 text-braise-vif">
                          <Icon size={20} strokeWidth={1.6} />
                        </span>
                        <div className="flex gap-1.5">
                          {game.accessType === "premium" && <Badge tone="or">Premium</Badge>}
                          <Badge tone="outline">{LEVEL_LABELS[game.level]}</Badge>
                        </div>
                      </div>
                      <CardTitle className="text-base">{game.title}</CardTitle>
                      <CardDescription className="flex-1">{game.description}</CardDescription>
                    </Card>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <section>
          <h2 className="mb-5 font-display text-lg text-ivoire">Classement</h2>
          {leaderboard.length === 0 ? (
            <Card>
              <p className="text-sm text-ivoire-dim">
                Personne n'a encore joué. Sois le premier à marquer des points.
              </p>
            </Card>
          ) : (
            <Card className="p-0">
              <ol>
                {leaderboard.map((entry) => (
                  <li
                    key={entry.userId}
                    className={cn(
                      "flex items-center gap-3.5 border-b border-ivoire/6 px-4 py-3 last:border-0",
                      session?.id === entry.userId && "bg-or/[0.06]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs",
                        entry.rank === 1
                          ? "bg-or text-noir"
                          : entry.rank === 2
                            ? "bg-ivoire/20 text-ivoire"
                            : entry.rank === 3
                              ? "bg-braise/25 text-braise-vif"
                              : "bg-ivoire/6 text-ivoire-faint",
                      )}
                    >
                      {entry.rank}
                    </span>
                    <Avatar name={entry.name} src={entry.avatarUrl} size={32} />
                    <span className="min-w-0 flex-1 truncate text-sm text-ivoire">
                      {entry.name}
                      {session?.id === entry.userId && (
                        <span className="ml-2 text-xs text-or">toi</span>
                      )}
                    </span>
                    <span className="shrink-0 font-mono text-sm text-or">{entry.points}</span>
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </section>

        <section>
          <h2 className="mb-5 font-display text-lg text-ivoire">Tes derniers défis</h2>
          {!session ? (
            <Card className="text-center">
              <p className="text-sm text-ivoire-dim">
                Crée ton compte pour participer et apparaître au classement.
              </p>
              <Link href="/inscription" className="mt-4 inline-block">
                <Button size="sm">Créer mon compte</Button>
              </Link>
            </Card>
          ) : attempts.length === 0 ? (
            <Card>
              <p className="text-sm text-ivoire-dim">Tu n'as pas encore relevé de défi.</p>
            </Card>
          ) : (
            <Card className="p-0">
              <ul>
                {attempts.map((attempt) => (
                  <li
                    key={attempt.id}
                    className="flex items-center justify-between gap-3 border-b border-ivoire/6 px-4 py-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ivoire">{attempt.challenge.title}</p>
                      <p className="text-xs text-ivoire-faint">
                        {attempt.correctCount}/{attempt.totalCount} ·{" "}
                        {formatRelative(attempt.createdAt)}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-sm text-or">+{attempt.score}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>
      </div>
    </PageTransition>
  );
}
