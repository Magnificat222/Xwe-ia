import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Pin, Lock, Plus, Users } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, EmptyState, SectionHeading, Stat } from "@/components/ui/misc";
import { PageTransition, Stagger, StaggerItem } from "@/components/motion";
import { getDiscussions, getCommunityStats } from "@/lib/queries/community";
import { getCategories } from "@/lib/queries/catalogue";
import { getSession } from "@/lib/auth/session";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Discussion",
  description: "Pose tes questions, partage tes avancées, aide les autres membres.",
};

export default async function DiscussionPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string; q?: string }>;
}) {
  const { categorie, q } = await searchParams;
  const [topics, categories, stats, session] = await Promise.all([
    getDiscussions({ categorySlug: categorie, q }),
    getCategories(),
    getCommunityStats(),
    getSession(),
  ]);

  return (
    <PageTransition className="mx-auto max-w-4xl space-y-7">
      <SectionHeading
        eyebrow="La communauté"
        title="Discussion"
        description="Une question, un blocage, une réussite à partager ? C'est ici."
        action={
          session ? (
            <Link href="/discussion/nouvelle">
              <Button icon={<Plus size={16} />}>Nouveau sujet</Button>
            </Link>
          ) : (
            <Link href="/inscription">
              <Button>Rejoindre</Button>
            </Link>
          )
        }
      />

      <Stagger className="grid grid-cols-3 gap-3">
        <StaggerItem>
          <Stat label="Sujets" value={stats.topics} icon={<MessageSquare size={18} />} tone="or" />
        </StaggerItem>
        <StaggerItem>
          <Stat label="Réponses" value={stats.replies} icon={<MessageSquare size={18} />} tone="braise" />
        </StaggerItem>
        <StaggerItem>
          <Stat label="Membres" value={stats.members} icon={<Users size={18} />} tone="feuillage" />
        </StaggerItem>
      </Stagger>

      <form action="/discussion" className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Rechercher un sujet…"
          aria-label="Rechercher un sujet"
          className="w-full rounded-xl border border-ivoire/15 bg-noir px-4 py-3 text-sm text-ivoire placeholder:text-ivoire-faint outline-none transition-all focus:border-or/60"
        />
        <Button type="submit" variant="secondary">
          Rechercher
        </Button>
      </form>

      <nav aria-label="Filtrer par catégorie" className="flex flex-wrap gap-2">
        <Link
          href="/discussion"
          className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
            !categorie
              ? "border-or bg-or/12 text-or-vif"
              : "border-ivoire/12 text-ivoire-dim hover:border-or/30 hover:text-ivoire"
          }`}
        >
          Tout
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/discussion?categorie=${category.slug}`}
            className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
              categorie === category.slug
                ? "border-or bg-or/12 text-or-vif"
                : "border-ivoire/12 text-ivoire-dim hover:border-or/30 hover:text-ivoire"
            }`}
          >
            {category.name}
          </Link>
        ))}
      </nav>

      {topics.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={22} />}
          title={q ? "Aucun sujet trouvé" : "Aucun sujet pour l'instant"}
          description={
            q
              ? "Essaie d'autres mots-clés."
              : "Lance la première discussion : une question, un retour d'expérience, une idée."
          }
          action={
            session ? (
              <Link href="/discussion/nouvelle">
                <Button icon={<Plus size={16} />}>Créer un sujet</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <Stagger className="space-y-2.5">
          {topics.map((topic) => (
            <StaggerItem key={topic.id}>
              <Link href={`/discussion/${topic.id}`}>
                <Card interactive className="py-4">
                  <div className="flex items-start gap-3.5">
                    <Avatar name={topic.author.name} src={topic.author.avatarUrl} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {topic.isPinned && <Pin size={13} className="text-or" fill="currentColor" />}
                        {topic.isLocked && <Lock size={13} className="text-ivoire-faint" />}
                        <CardTitle className="text-sm leading-snug">{topic.title}</CardTitle>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ivoire-dim">
                        {topic.body}
                      </p>
                      <p className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] text-ivoire-faint">
                        <span>{topic.author.name}</span>
                        <span>{formatRelative(topic.lastActivityAt)}</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={11} /> {topic.replyCount}
                        </span>
                        {topic.category && <Badge tone="outline">{topic.category.name}</Badge>}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </PageTransition>
  );
}
