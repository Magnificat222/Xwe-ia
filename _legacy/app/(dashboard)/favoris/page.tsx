import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/favoris");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: { mission: true, learningPath: true, prompt: true, tool: true },
    orderBy: { createdAt: "desc" },
  });

  const missionFavs = favorites.filter((f) => f.mission);
  const pathFavs = favorites.filter((f) => f.learningPath);
  const promptFavs = favorites.filter((f) => f.prompt);
  const toolFavs = favorites.filter((f) => f.tool);

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Favoris</p>
        <h1 className="mt-2 font-display text-3xl text-ivoire">Vos favoris</h1>
      </div>

      {favorites.length === 0 && (
        <p className="text-ivoire-dim">
          Rien en favoris pour l'instant. Ajoutez des missions, prompts,
          parcours ou outils depuis leurs pages respectives.
        </p>
      )}

      {missionFavs.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl text-ivoire">Missions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {missionFavs.map((f) => (
              <Link key={f.id} href={`/missions/${f.mission!.slug}`}>
                <Card>
                  <p className="font-display text-base text-ivoire">{f.mission!.title}</p>
                  {f.mission!.isPremium && <Badge tone="gold" className="mt-2">Premium</Badge>}
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {pathFavs.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl text-ivoire">Parcours</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {pathFavs.map((f) => (
              <Link key={f.id} href={`/parcours/${f.learningPath!.slug}`}>
                <Card>
                  <p className="font-display text-base text-ivoire">{f.learningPath!.title}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {promptFavs.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl text-ivoire">Prompts</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {promptFavs.map((f) => (
              <Card key={f.id}>
                <p className="font-display text-base text-ivoire">{f.prompt!.title}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {toolFavs.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl text-ivoire">Outils IA</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {toolFavs.map((f) => (
              <Card key={f.id}>
                <p className="font-display text-base text-ivoire">{f.tool!.name}</p>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
